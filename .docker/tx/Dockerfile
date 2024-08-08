FROM univer-acr-registry.cn-shenzhen.cr.aliyuncs.com/release/python:3.6-alpine

RUN env

RUN apk add --no-cache git
RUN pip install transifex-client

CMD ["tx", "--version"]
