module.exports = {
  configureWebpack: {
    resolve: {
      symlinks: false
    }
  },
  devServer: {
    host: 'localhost',
    proxy: {
      '^/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
    }
  },
  runtimeCompiler: true,
}
