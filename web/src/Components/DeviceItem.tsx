import {Card} from 'react-bootstrap';

type DeviceItemProps = {
    id : number
    name: string
    imgUrl : string
}

export function DeviceItem({id, name, imgUrl} : DeviceItemProps){
    return (
    <Card>
        <Card.Img
         variant ="top" 
         src = {imgUrl} 
         height = "200px" 
        style = {{objectFit : "cover"}} />
    </Card>
    )

}