import server from 'server'
import { render } from 'server/reply'
import { get } from 'server/router'

server({ port: 3000, public: 'dist', views: 'dist' }, [
  get('/', _ctx => render('index.html'))
])
