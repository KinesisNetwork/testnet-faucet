# Testnet Faucet

Faucet to receive testnet funds for Kinesis currencies

## Development

The server and client files are together in this repo.

To run a server that will restart automatically on errors/crashes etc (courtesy of PM2) run

`npm start`

Then to start the watchers to update the code building (TS and parcel) run

`npm run watch`

The app will by default be running at `localhost:3000`