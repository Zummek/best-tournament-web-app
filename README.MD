# Best tournament app

It's the best tournament application for make fun in companies

## Install the dependencies in subfolders

```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
# web application
quasar dev

#server
yarn dev
```

### Lint the files

```bash
yarn run lint
```

### Build the app for production

```bash
# web application
quasar build

#server
yarn build
```

## Docker

### Start the database (mongodb) via docker. Use `-d` to run in background

```bash
sudo docker-compose up -d
```

### See logs from database

```bash
sudo docker logs mongodb
```

### Interacting with the MongoDB container

#### Note: there You will have access to `mongo` CLI

```bash
sudo docker exec -it mongodb bash
```