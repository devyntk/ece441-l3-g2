import {Card} from 'react-bootstrap';

type DeviceItemProps = {
    id : number
    name: string
    Details : string
    Usage : string
    Livability : string
    imgUrl : string
}

export function DeviceItem({id, name, Details, Usage, Livability, imgUrl} : DeviceItemProps){
    return (
    <Card>
        <Card.Img
         variant ="middle" 
         src = {imgUrl} 
         height = "200px" 
        style = {{objectFit : "cover"}} />
        <Card.Body className = "d-flex flex-column">
        <Card.Title className = "d-flex justify-content-space-between align-items-baseline mb-4">
            <span className = "fs-5"> {name} </span>
            <span className = "fs-5"> {Details} </span>
            <span className = "fs-5"> {Usage} </span>
            <span className = "fs-5"> {Livability} </span>


        </Card.Title>
        </Card.Body>
        </Card>
    )

}