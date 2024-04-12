# NATS testground

Add the repository for the NATS Helm chart as described here:
https://github.com/nats-io/k8s

Deploy nats with JetStream and load balacning using Helm
```bash
helm install nats nats/nats -f nats.yaml
```
