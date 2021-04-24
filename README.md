# sns-frontend
sns-frontend



Delete Image using a pattern
docker images -a | grep "deviator206/sns-frontend" | awk '{print $3}' | xargs docker rmi


