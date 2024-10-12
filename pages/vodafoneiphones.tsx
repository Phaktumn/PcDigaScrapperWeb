
import { Stack, Toolbar } from "@mui/material"
import axios from "axios";

import {
    Anchor,
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    Collapsible,
    Heading,
    Grommet,
    Image,
    Paragraph,
    Select,
    PageContent,
    Page,
    Text,
    CheckBox
} from 'grommet';

import { Add, FormDown, FormUp, Favorite, ShareOption } from 'grommet-icons';

import { useState } from "react"
import { Product } from "../models/Product";
import { getApiUrl } from "./main";
import { BaseSampleProduct, ProductPrice, SampleProduct } from "../models/ProductPrice";

function createUrl(cor: string, storage: string): string {
    let corenc = encodeURI(cor);
    return 'https%3A%2F%2Fwww.vodafone.pt%2Floja%2Ftelemoveis%2Fapple%2Fiphone-16-pro-5g.html%3Fcolor%3D' +
        corenc
        + '%26storage%3D' +
        storage
        + '%26paymentType%3Dcv%26segment%3Dconsumer'
}

function VodafoneIphones() {

    const cores = [
        'Titânio Branco',
        'Titânio Deserto',
        'Titânio Natural',
        'Titânio Preto'
    ]
    const storageValues = [
        '128', '256', '512', '1'
    ]
    const urls = [
        'https%3A%2F%2Fwww.vodafone.pt%2Floja%2Ftelemoveis%2Fapple%2Fiphone-16-pro-5g.html%3Fcolor%3Dtit%25C3%25A2nio%2520preto%26storage%3D128%26paymentType%3Dcv%26segment%3Dconsumer',
    ]

    let [cor, setCor] = useState<string | any>();
    let [storage, setstorage] = useState<string | any>();
    let [product, setProduct] = useState<SampleProduct>();

    return (
        <Page kind="narrow">
            <PageContent background="light-3">

                <Toolbar disableGutters>

                    <Stack direction="row" spacing={6} sx={{ display: { xs: "none", md: "flex" } }}>
                        <Select
                            options={cores}
                            value={cor}
                            onChange={({ option }) => { setCor(option); }}
                        />
                        <Select
                            options={storageValues}
                            value={storage}
                            onChange={({ option }) => { setstorage(option); }}
                        />
                        <Button onClick={async () => {
                            console.log(`${getApiUrl()}/validate?url=${createUrl(cor, storage)}`);
                            let r = await axios.get<BaseSampleProduct>(`${getApiUrl()}/validate?url=${createUrl(cor, storage)}`);
                            setProduct(r.data.scrappedValue);
                        }} active>
                            <Box pad="small" direction="row" align="center" gap="small">
                                <Add />
                                <Text>Validate</Text>
                            </Box>
                        </Button>
                    </Stack>
                </Toolbar>
                {product != null &&
                    <Box
                        pad="small"
                        background={{ color: 'brand', opacity: true }}
                    >
                        <Card elevation="large" width="medium">
                            <CardBody height="small">
                                <Image
                                    fit="cover"
                                    src={product.image}
                                    a11yTitle="iphone"
                                    alt="image"
                                />
                            </CardBody>
                            <Box pad={{ horizontal: 'medium' }} responsive={false}>
                                <Heading level="3" margin={{ vertical: 'medium' }}>
                                    {product.name}
                                </Heading>
                                <Paragraph margin={{ top: 'none' }}>
                                    <p>Color: {product.options?.color}</p>
                                    <p>Storage: {product.options?.storage}</p>
                                    
                                    <CheckBox
                                        checked={product.available}
                                        label="Available"
                                    />
                                    
                                </Paragraph>
                            </Box>
                            <CardFooter>
                                <Text size='large'>{product.currentPrice}</Text>
                            </CardFooter>
                        </Card>
                    </Box>
                }



            </PageContent>
        </Page>
    )
}


export { VodafoneIphones }