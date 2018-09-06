# Testnet Faucet

Faucet to receive testnet funds for Kinesis currencies

## Development

The server and client files are together in this repo.

To run a server that will restart automatically on errors/crashes etc (courtesy of PM2) run

`npm start`

Then to start the watchers to update the code building (TS and parcel) run

`npm run watch`

(Alternatively run the command `npm run dev` which does both of the above)

The app will by default be running at `localhost:3000`