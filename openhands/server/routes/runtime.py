from __future__ import annotations

import asyncio
from typing import Literal

import docker
from fastapi import APIRouter

from openhands.core.logger import openhands_logger as logger
from openhands.runtime import get_runtime_cls
from openhands.runtime.builder import DockerRuntimeBuilder
from openhands.runtime.utils.runtime_build import build_runtime_image
from openhands.server.dependencies import get_dependencies
from openhands.server.shared import config


app = APIRouter(prefix='/api/runtime', dependencies=get_dependencies())


async def _prewarm_docker_runtime_image() -> str | None:
    try:
        runtime_image = build_runtime_image(
            base_image=config.sandbox.base_container_image or '',
            runtime_builder=DockerRuntimeBuilder(docker.from_env()),
            platform=config.sandbox.platform,
            extra_deps=config.sandbox.runtime_extra_deps,
            force_rebuild=False,
            extra_build_args=config.sandbox.runtime_extra_build_args,
            enable_browser=config.enable_browser,
        )
        logger.info(f'Runtime prewarm complete. Image: {runtime_image}')
        return runtime_image
    except Exception as e:
        logger.error(f'Runtime prewarm failed: {e}')
        return None


@app.post('/prewarm')
async def prewarm_runtime() -> dict[str, str | bool]:
    """Kick off runtime prewarming in the background.

    - For docker runtime: prebuild the runtime image (if missing/cached).
    - For local runtime: ensure setup is invoked (warm servers via env vars).
    """
    runtime_cls = get_runtime_cls(config.runtime)

    # Always call setup to allow implementations (e.g., LocalRuntime) to initialize warm pools
    try:
        runtime_cls.setup(config)
    except Exception as e:
        logger.warning(f'Runtime setup during prewarm threw: {e}')

    status: Literal['started', 'unsupported', 'skipped'] = 'started'

    # Only docker has an image to prebuild here
    if runtime_cls.__name__ == 'DockerRuntime':
        # Run the build in background without blocking the request
        asyncio.create_task(_prewarm_docker_runtime_image())
        return {'status': status, 'runtime': 'docker'}

    # For LocalRuntime/Kubernetes/Remote/etc., setup() is sufficient for now
    return {'status': 'skipped', 'runtime': runtime_cls.__name__}

