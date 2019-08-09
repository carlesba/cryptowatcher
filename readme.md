# Cryptowatch

## Run server locally

Get an API key for [coinMarketCap](https://coinmarketcap.com/api/)

Create a `.env` file from `.env-template` and add you coinMarketCap API key

Install docker ([Visit docker.com](https://docs.docker.com/))

Build locally

```
docker-compose build
```

Run the container

```
docker-compose up -d
```

Stop the container using

```
docker-compose down
```

## Run tests

Install dependencies

```
npm install
```

Run tests

```
npm test
```