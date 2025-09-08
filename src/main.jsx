import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { Route,Routes,BrowserRouter } from 'react-router'
import {store} from "./stores/store"
import {Provider} from "react-redux"
import App from './app'


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
  <BrowserRouter>
      <App></App>
  </BrowserRouter>
  </Provider>
)
