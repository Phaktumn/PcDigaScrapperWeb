import '../styles/globals.css'
import '../styles/App.css'

import { MainScrapperComponent } from "./main";
import { hpe } from 'grommet-theme-hpe';
import { Grommet } from 'grommet';

function MyApp() {
  return (
    
      <Grommet theme={hpe} themeMode={'dark'} style={{ minHeight: "100vh" }}>
        <MainScrapperComponent></MainScrapperComponent>
      </Grommet>
  )
}

export default MyApp;
