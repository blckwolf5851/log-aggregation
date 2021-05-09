minikube stop
minikube delete
minikube start --driver=hyperv
minikube -p minikube docker-env
@FOR /f "tokens=*" %i IN ('minikube -p minikube docker-env') DO @%i