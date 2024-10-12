import React from 'react'
import { Tab, Tabs } from "grommet"
import TechScrapper from './TechScrapper'
import { VodafoneIphones } from './vodafoneiphones'

const API_URL = 'http://localhost:8000';//'https://pcdigascrapper.herokuapp.com';

export function getApiUrl() {
    return API_URL;
}

export function MainScrapperComponent() {
    return <Tabs>
        <Tab title='Scrap Tech'>
            <TechScrapper></TechScrapper>
        </Tab>
        <Tab title='Vodafone Iphones'>
            <VodafoneIphones></VodafoneIphones>
        </Tab>
    </Tabs>
}

module.exports = {
    MainScrapperComponent,
    getApiUrl
}