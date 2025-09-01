#!/usr/bin/env bash

# AgentMojo Remote Deployment Examples
# This file contains example commands for deploying AgentMojo to remote servers

echo "AgentMojo Remote Deployment Examples"
echo "======================================"
echo

# Example 1: Basic deployment with password authentication
echo "Example 1: Basic deployment with password authentication"
echo "./deploy_remote.sh -u ubuntu -h agentmojo.sixtyoneeighty.com"
echo

# Example 2: Deployment with SSH key
echo "Example 2: Deployment with SSH key"
echo "./deploy_remote.sh -u ubuntu -h agentmojo.sixtyoneeighty.com -k ~/.ssh/id_rsa"
echo

# Example 3: Deployment to custom port
echo "Example 3: Deployment to custom SSH port"
echo "./deploy_remote.sh -u root -h 192.168.1.100 -p 2222"
echo

# Example 4: Deployment with custom directory and branch
echo "Example 4: Deployment with custom directory and branch"
echo "./deploy_remote.sh -u ubuntu -h server.example.com -d /opt/deploy -b development"
echo

# Example 5: AWS EC2 deployment
echo "Example 5: AWS EC2 deployment"
echo "./deploy_remote.sh -u ec2-user -h ec2-xx-xxx-xxx-xxx.compute-1.amazonaws.com -k ~/.ssh/aws-key.pem"
echo

# Example 6: DigitalOcean droplet deployment
echo "Example 6: DigitalOcean droplet deployment"
echo "./deploy_remote.sh -u root -h 159.89.123.456 -k ~/.ssh/digitalocean_rsa"
echo

# Example 7: Google Cloud VM deployment
echo "Example 7: Google Cloud VM deployment"
echo "./deploy_remote.sh -u ubuntu -h 35.123.456.789 -k ~/.ssh/google_compute_engine"
echo

echo "Usage Tips:"
echo "- Replace hostnames/IPs with your actual server details"
echo "- Ensure your SSH key has proper permissions (chmod 600 ~/.ssh/your_key)"
echo "- Test SSH connection manually first: ssh -i ~/.ssh/your_key user@host"
echo "- The deployment takes 10-20 minutes depending on server specs"
echo

echo "For help: ./deploy_remote.sh --help"