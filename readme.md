# Cryptowatch

This is an excercise to experiment with Docker, Express, Preact and mongoose. 
The service allows you to watch cryptocurrencies using CoinMarketCap's API.

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

## Frontend App

Shows a list of all cryptocurrencies being watched by the system. Select any of them to see the list of prices. The application will update the list everytime the server finds a new price.

### How to add cryptocurrencies to the system

Add `?admin=handleSubscriptions` to the URL. This will show a form.

Fill the input with the symbol you want to add to the system. It's case sensitive.


Add symbols to the system with
