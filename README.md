# sns-frontend
sns-frontend



## Delete Image using a pattern
docker images -a | grep "deviator206/sns-frontend" | awk '{print $3}' | xargs docker rmi


## Expose Container for Web Application
FROM nginx:stable-perl
COPY  ./app  /usr/share/nginx/html

## Expose Container port to outside
  > docker run -it -p 80:80 --name mylocaldev5  mydev:latest
  > access http://localhost:80/index.html


## Check if Container has your files
docker exec it <container_id_or_name> /bin/bash

## 
