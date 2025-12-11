const { defineConfig } = require('@vue/cli-service')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/house-rental-demo/'
    : '/',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'public'),
      publicPath: '/',
      watch: true
    },
    proxy: {
      '/api': {
        target: 'https://api.map.baidu.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined')
      }
      devServer.app.use('/mapvthree', require('express').static(
        path.resolve(__dirname, 'node_modules/@baidumap/mapv-three/dist')
      ))
      return middlewares
    }
  },
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'node_modules/@baidumap/mapv-three/dist/assets'),
            to: path.resolve(__dirname, 'dist/mapvthree/assets'),
            noErrorOnMissing: true
          },
          {
            from: path.resolve(__dirname, 'node_modules/@baidumap/mapv-three/dist/libs'),
            to: path.resolve(__dirname, 'dist/mapvthree/libs'),
            noErrorOnMissing: true
          }
        ]
      })
    ]
  }
})
