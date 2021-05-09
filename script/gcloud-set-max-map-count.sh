#!/bin/bash -eu

# Increase Virtual Memory for Elasticsearch on GKE
# https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html
# Dependencies: kubectl, gcloud, jq

nodes() {
	kubectl get nodes -o custom-columns=n:.metadata.name --no-headers
}

zone_by_node() {
	local node=$1
	kubectl get node $node -o json \
		 | jq -r '.metadata.labels["failure-domain.beta.kubernetes.io/zone"]'
}

gcloud_ssh() {
	local node=$1 && shift
	echo ">> ssh $node"
	gcloud compute ssh --zone $(zone_by_node $node) $node -- sudo bash -c "'"$@"'"
}

main() {
	for node in $(nodes); do
		gcloud_ssh $node \
			"sysctl -w vm.max_map_count=262144 && sysctl -n vm.max_map_count"
	done
}

main