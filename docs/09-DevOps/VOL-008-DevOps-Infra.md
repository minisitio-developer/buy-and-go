# VOL-008 — DevOps & Infrastructure

**EventOS AI Enterprise**
**Versão:** 0.0.1
**Status:** Draft

---

## Infrastructure Principles

- **Immutable Infrastructure:** No manual server changes. Everything as code.
- **GitOps:** ArgoCD syncs cluster state from Git.
- **Shift Left:** Security and quality checks in CI.
- **Canary Deploys:** Gradual rollout for all services.
- **Auto Scaling:** HPA based on CPU/memory/custom metrics.
- **Backup Everything:** Point-in-time recovery for all databases.

---

## Local Development

### Docker Compose

```yaml
# docker-compose.yml
version: "3.9"
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: eventos
      POSTGRES_USER: eventos
      POSTGRES_PASSWORD: eventos_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  elasticsearch:
    image: elasticsearch:8.11
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

  kafka:
    image: confluentinc/cp-kafka:7.5
    depends_on:
      - zookeeper
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
    ports:
      - "9092:9092"

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  clickhouse:
    image: clickhouse/clickhouse-server:23
    ports:
      - "8123:8123"

  identity-svc:
    build: ./backend/services/identity
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
      - kafka
    environment:
      - DATABASE_URL=postgresql://eventos:eventos_dev@postgres:5432/eventos
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKER=kafka:9092
      - JWT_SECRET=dev_secret

volumes:
  pgdata:
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: eventos_test
          POSTGRES_USER: eventos
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
      - run: npm run test:coverage

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build

  docker:
    needs: [build]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: |
            ghcr.io/eventos-ai/identity-svc:${{ github.sha }}
            ghcr.io/eventos-ai/identity-svc:latest
```

### CD with ArgoCD

```yaml
# k8s/overlays/prod/identity-svc.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: identity-svc
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/eventos-ai/enterprise-platform
    path: k8s/overlays/prod/identity-svc
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: eventos-prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

---

## Dockerfile

```dockerfile
# backend/services/identity/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system eventos && adduser --system eventos
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER eventos
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1
CMD ["node", "dist/main"]
```

---

## Kubernetes Manifests

### Namespaces

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: platform-core
---
apiVersion: v1
kind: Namespace
metadata:
  name: eventos-prod
---
apiVersion: v1
kind: Namespace
metadata:
  name: data-layer
---
apiVersion: v1
kind: Namespace
metadata:
  name: ai-services
---
apiVersion: v1
kind: Namespace
metadata:
  name: platform-ops
```

### Identity Service Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: identity-svc
  namespace: platform-core
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: identity-svc
  template:
    metadata:
      labels:
        app: identity-svc
    spec:
      containers:
        - name: identity-svc
          image: ghcr.io/eventos-ai/identity-svc:latest
          ports:
            - containerPort: 3001
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secrets
                  key: DATABASE_URL
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: redis-secrets
                  key: REDIS_URL
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: jwt-secrets
                  key: JWT_SECRET
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 5
            periodSeconds: 10
```

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: identity-svc-hpa
  namespace: platform-core
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: identity-svc
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: identity-svc
  namespace: platform-core
spec:
  selector:
    app: identity-svc
  ports:
    - port: 3001
      targetPort: 3001
  type: ClusterIP
```

### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-gateway
  namespace: platform-core
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.eventos.ai
      secretName: eventos-tls
  rules:
    - host: api.eventos.ai
      http:
        paths:
          - path: /v1/auth
            pathType: Prefix
            backend:
              service:
                name: identity-svc
                port:
                  number: 3001
          - path: /v1/events
            pathType: Prefix
            backend:
              service:
                name: event-svc
                port:
                  number: 3002
```

---

## Terraform (AWS)

```hcl
# terraform/main.tf
provider "aws" {
  region = "us-east-1"
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "eventos-ai-prod"
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  node_groups = {
    main = {
      desired_capacity = 3
      min_capacity     = 3
      max_capacity     = 20

      instance_types = ["t3.large"]

      k8s_labels = {
        Environment = "production"
        Service     = "platform"
      }
    }

    ai = {
      desired_capacity = 2
      min_capacity     = 2
      max_capacity     = 10

      instance_types = ["g4dn.xlarge"]  # GPU for AI

      k8s_labels = {
        Environment = "production"
        Service     = "ai"
      }
    }
  }
}

module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "eventos-prod"

  engine         = "postgres"
  engine_version = "16"
  instance_class = "db.r6g.large"

  allocated_storage     = 100
  max_allocated_storage = 500

  db_name  = "eventos"
  username = "eventos"

  vpc_security_group_ids = [module.vpc.default_security_group_id]
  db_subnet_group_name   = module.vpc.database_subnet_group

  backup_window      = "03:00-04:00"
  backup_retention_period = 30

  multi_az = true
}

module "elasticache" {
  source  = "terraform-aws-modules/elasticache/aws"
  version = "~> 3.0"

  cluster_id = "eventos-redis"

  engine         = "redis"
  engine_version = "7.1"
  node_type      = "cache.r6g.large"

  num_cache_nodes = 2

  subnet_ids = module.vpc.private_subnets
}

module "s3" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "~> 3.0"

  bucket = "eventos-ai-storage"

  versioning = {
    enabled = true
  }

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }
}
```

---

## Monitoring Stack

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "kubernetes-pods"
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__

  - job_name: "kafka"
    static_configs:
      - targets: ["kafka:9092"]
```

### Grafana Dashboards

| Dashboard | Description |
|-----------|-------------|
| Service Health | CPU, memory, request rate, error rate, latency |
| Business Metrics | Check-ins, orders, revenue (real-time) |
| Kafka | Consumer lag, topic throughput, partition health |
| Database | Connections, query time, cache hit ratio |
| Infrastructure | Node status, pod status, cluster resources |

### Alerts

```yaml
# alerts.yml
groups:
  - name: platform
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.service }}"

      - alert: ServiceDown
        expr: up{job="kubernetes-pods"} == 0
        for: 1m
        labels:
          severity: critical

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning

      - alert: KafkaConsumerLag
        expr: kafka_consumer_lag > 1000
        for: 5m
        labels:
          severity: critical
```

---

## Backup Strategy

| Resource | Backup Method | Frequency | Retention | Restore RTO |
|----------|--------------|-----------|-----------|-------------|
| PostgreSQL | pg_dump + WAL streaming | Hourly + continuous | 30 days | 1h |
| Redis | AOF + RDB snapshots | Every 6h | 7 days | 10min |
| ElasticSearch | Snapshot to S3 | Daily | 30 days | 30min |
| Kafka | Topic replication + backup | Continuous | 7 days | 5min |
| S3/R2 | Cross-region replication | Real-time | Infinite | 1h |
| Kubernetes | Velero (cluster backup) | Daily | 30 days | 2h |

```yaml
# velero schedule
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: daily-backup
  namespace: velero
spec:
  schedule: "0 2 * * *"
  template:
    includedNamespaces:
      - platform-core
      - eventos-prod
      - data-layer
    ttl: 720h  # 30 days
```

---

## Secret Management

```yaml
# External Secrets Operator
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-secrets
  namespace: platform-core
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secret-manager
    kind: ClusterSecretStore
  target:
    name: db-secrets
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: /eventos/prod/database
        property: DATABASE_URL
    - secretKey: DATABASE_PASSWORD
      remoteRef:
        key: /eventos/prod/database
        property: password
```

---

## Related Documents

- VOL-002: Architecture (Service catalog, K8s namespaces)
- VOL-010: Monitoring (OpenTelemetry, traces)
- VOL-011: Security (Secrets, encryption, network policies)
