# Cryptowatch

## Getting started

Get an API key for [coinMarketCap](https://coinmarketcap.com/api/)

Create a `.env` file from `.env-template`.

Edit `.env` with your variables:
- Add you coinMarketCap API key
- Update email configuration (you can use [Ethereal](https://ethereal.email/) for testing)

Install docker ([Visit docker.com](https://docs.docker.com/))

## Running application

Use make commands to start the program in containers.
Check the `Makefile` to find detach modes.

### Production

Start production mode
```
make
```

Stop
```
make production-down
```

### Run tests

```
make test
```

### Api development

Start just the api server
```
make api-development
```

Stop
```
make api-development-down
```

### Web development

Start the web server with hot loader (autoupdate) and the api-server in the background
```
make web-development
```

Stop
```
make web-development-down
```

