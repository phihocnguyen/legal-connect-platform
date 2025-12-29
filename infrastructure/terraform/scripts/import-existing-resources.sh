#!/bin/bash

# Script to import existing AWS resources into Terraform state
# Run this script when you encounter "already exists" errors

set -e

PROJECT="legal-connect"
ENV="prod"
REGION="ap-southeast-2"

echo "================================================"
echo "Terraform Resource Import Script"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if resource exists in state
resource_exists() {
    terraform state show "$1" &>/dev/null
    return $?
}

# Function to import resource
import_resource() {
    local tf_resource=$1
    local aws_id=$2
    local description=$3
    
    echo -e "${YELLOW}Checking: ${description}${NC}"
    
    if resource_exists "$tf_resource"; then
        echo -e "${GREEN}✓ Already in state${NC}"
        return 0
    fi
    
    echo "Importing $description..."
    if terraform import "$tf_resource" "$aws_id" 2>/dev/null; then
        echo -e "${GREEN}✓ Import successful${NC}"
    else
        echo -e "${RED}✗ Import failed (resource might not exist)${NC}"
    fi
    echo ""
}

echo "Starting import process..."
echo ""

# S3 Buckets
echo "=== S3 Buckets ==="
import_resource "module.s3.aws_s3_bucket.frontend" \
    "${PROJECT}-${ENV}-frontend" \
    "Frontend S3 Bucket"

import_resource "module.s3.aws_s3_bucket.pdfs" \
    "${PROJECT}-${ENV}-pdfs" \
    "PDFs S3 Bucket"

import_resource "module.s3.aws_s3_bucket.avatars" \
    "${PROJECT}-${ENV}-avatars" \
    "Avatars S3 Bucket"

import_resource "module.s3.aws_s3_bucket.logs" \
    "${PROJECT}-${ENV}-logs" \
    "Logs S3 Bucket"

# S3 Bucket Configurations
echo "=== S3 Bucket Configurations ==="

# Get NAT Gateway IDs
echo "Fetching NAT Gateway IDs..."
NAT_GW_IDS=$(aws ec2 describe-nat-gateways \
    --region $REGION \
    --filter "Name=tag:Name,Values=${PROJECT}-${ENV}-nat-*" \
    --query 'NatGateways[?State!=`deleted`].NatGatewayId' \
    --output text)

if [ ! -z "$NAT_GW_IDS" ]; then
    echo "=== NAT Gateways ==="
    NAT_ARRAY=($NAT_GW_IDS)
    
    for i in "${!NAT_ARRAY[@]}"; do
        NAT_ID="${NAT_ARRAY[$i]}"
        import_resource "module.vpc.aws_nat_gateway.main[$i]" \
            "$NAT_ID" \
            "NAT Gateway $i"
    done
else
    echo "No NAT Gateways found to import"
fi

# RDS Instance
echo "=== RDS Database ==="
import_resource "module.rds.aws_db_instance.main" \
    "${PROJECT}-${ENV}-db" \
    "RDS Database Instance"

# ECS Cluster
echo "=== ECS Resources ==="
import_resource "module.ecs.aws_ecs_cluster.main" \
    "${PROJECT}-${ENV}-cluster" \
    "ECS Cluster"

# Check if ECS Service exists
ECS_SERVICE_ARN=$(aws ecs list-services \
    --cluster ${PROJECT}-${ENV}-cluster \
    --region $REGION \
    --query 'serviceArns[0]' \
    --output text 2>/dev/null || echo "")

if [ ! -z "$ECS_SERVICE_ARN" ] && [ "$ECS_SERVICE_ARN" != "None" ]; then
    import_resource "module.ecs.aws_ecs_service.backend" \
        "${PROJECT}-${ENV}-cluster/${PROJECT}-${ENV}-backend-service" \
        "ECS Service"
fi

echo ""
echo "================================================"
echo "Import process completed!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Run: terraform plan"
echo "2. Review the planned changes"
echo "3. Run: terraform apply"
echo ""
