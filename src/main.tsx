import {StrictMode} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App';
import './styles.css';

const root=document.getElementById('root');
if(root){
  hydrateRoot(root,<StrictMode><BrowserRouter><App/></BrowserRouter></StrictMode>);
}
