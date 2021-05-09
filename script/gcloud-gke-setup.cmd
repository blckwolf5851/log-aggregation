git clone https://github.com/blckwolf5851/log-aggregation.git
cd log-aggregation
gcloud auth configure-docker
gcloud config set project log-aggregation-test
gcloud config set compute/zone us-central1-a
gcloud container clusters create log-aggregation-cluster
gcloud container clusters get-credentials log-aggregation-cluster --zone us-central1-a
kubectl apply -f .