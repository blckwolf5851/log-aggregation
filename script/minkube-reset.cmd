minikube stop
minikube delete
minikube start --driver=hyperv --memory 6192
minikube addons enable ingress
minikube -p minikube docker-env
@FOR /f "tokens=*" %i IN ('minikube -p minikube docker-env') DO @%i