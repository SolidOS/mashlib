# Try mashlib out using local solid-ui files etc
#
echo "Building rdflib:"
(cd ../../linkeddata/rdflib.js && npm run build)
echo "Building solid-ui:"
(cd ../../solidos/solid-ui && npm run build)
# echo "Building solid-panes:"
#  (cd ../../solidos/solid-panes && npm run build-dev)

rm -f package-lock.json
echo "Deleteing node_modules..."
rm -rf node_modules/
echo "Installing mashlib"
npm install

echo "Linking solid-panes"
rm -rf node_modules/solid-panes/
ln -s /devel/github.com/solidos/solid-panes/ node_modules/solid-panes

echo "Linking solid-ui"
rm -rf node_modules/solid-ui/
ln -s /devel/github.com/solidos/solid-ui/ node_modules/solid-ui

# was: --config webpack-no-mini.config.js
# webpack --config-name local-webpack.config.js --progress
# npm run build:dev:local
webpack --mode development --config-name local-webpack.config.js --color --progress
date
ls -ltr dist
# ends
