module.exports = ({ platform }, { module, resolve }) => ({
	entry: `./index.${platform}.js`,
	resolve: {
    ...resolve,
    extensions: process.env.APP_ENV === 'detox_tests' 
            ? ['.mock.behaviour.js', ...resolve.extensions]
            : resolve.extensions
  },
	module: {
		...module,
		rules: [
			{
        test: /\.js?$/,
        include: [
          /node_modules\/pouchdb-adapter-asyncstorage/,
          /node_modules\/react-native-vector-icons/,
          /node_modules\/cipher-base/,
        ],
        use: [
          {
            loader: "babel-loader"
          }
        ]
      },
			{
        test: /\.tsx?$/,
        exclude: '/node_modules/',
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader'
          },
        ],
			},
			...module.rules
		]
	},
	node: {
		fs: "empty"
 	}
});