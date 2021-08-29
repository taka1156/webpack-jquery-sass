const MODE = process.env.NODE_ENV;
// ソースマップの利用有無(productionのときはソースマップを利用しない)
const isProd = MODE === 'development';

// ファイル出力時の絶対パス指定に使用
const path = require('path');
// html
const HtmlWebpackPlugin = require('html-webpack-plugin');
// js最適化
const TerserPlugin = require('terser-webpack-plugin');
// css最適化
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
// css抽出
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// jQueryで使用
const webpack = require('webpack');

module.exports = {
  // エントリーポイント(メインのjsファイル)
  //entry: './src/app.js',
  entry: {
    'app':'./src/js/main.js',
    'main.css':'./src/scss/main.scss'
  },
  resolve: {
    extensions: ['.js'],
  },
  // ファイルの出力設定
  output: {
    // 出力先(絶対パスでの指定必須)
    path: path.resolve(__dirname, './dist'),
    // 出力ファイル名
    filename: './js/[name].js',
  },
  mode: MODE,
  // ソースマップ有効
  devtool: 'source-map',
  // ローダーの設定
  module: {
    rules: [
      {
        // ローダーの対象 // 拡張子 .js の場合
        test: /\.js$/,
        // ローダーの処理対象から外すディレクトリ
        exclude: /node_modules/,
        use: [
          {
            // Babel を利用する
            loader: 'babel-loader',
            // Babel のオプションを指定する
            options: {
              presets: [
                // プリセットを指定することで、ES2019 を ES5 に変換
                '@babel/preset-env',
              ],
            },
          },
        ],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        // Sassファイルの読み込みとコンパイル
        use: [
          'style-loader',
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // css出力先を指定
              publicPath: path.resolve(__dirname, 'dist/css'),
              esModule: false,
            },
          },
          // CSSをバンドルするための機能
          {
            loader: 'css-loader',
            options: {
              url: false,
              // ソースマップの利用有無
              sourceMap: isProd,
              importLoaders: 2,
            },
          },
          // PostCSS(Autoprefixer)のための設定
          // ベンダープレフィックスを追加するためのPostCSS用プラグイン
          {
            loader: 'postcss-loader',
            options: {
              // PostCSS側でもソースマップを有効にする
              sourceMap: isProd,
              postcssOptions: {
                plugins: [
                  // Autoprefixerを有効化
                  require('autoprefixer')({
                    grid: true,
                  }),
                ],
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              // ソースマップの利用有無
              sourceMap: isProd,
            },
          },
        ],
      },
    ],
  },
  // mode:puroductionでビルドした場合のファイル圧縮
  optimization: {
    minimizer: isProd
      ? []
      : [
          // jsファイルの最適化
          new TerserPlugin({
            extractComments: 'all',
            terserOptions: {
              compress: { drop_console: true },
            },
          }),
          // 抽出したcssファイルの最適化
          new CssMinimizerPlugin(),
        ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    open: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/html/index.html'),
      filename: './index.html',
      chunks: [
        'app',
        'main.css',
      ]
    }),
    new CssMinimizerPlugin({
      test: /\.optimize\.css$/g,
      minify: CssMinimizerPlugin.cleanCssMinify,
      minimizerOptions: {
        preset: [
          'default',
          {
            discardComments: { removeAll: true },
            minifyFontValues: { removeQuotes: false },
          },
        ],
      },
    }),
    new MiniCssExtractPlugin({
      filename: './css/[name]',
      chunkFilename: '[id].css',
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
    }),
  ],
};
