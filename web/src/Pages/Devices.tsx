import devicesItems from "../Devices.json"
import {Col, Row} from "react-bootstrap"
import {DeviceItem} from "../Components/DeviceItem"


export default function Devices() {
    return(
        <>
    <h1>Devices</h1>
    <Row md ={2} xs = {1} lg = {3} classname = "g-3">
        {devicesItems.map(item => (
            <Col key = {item.id}>
                <DeviceItem {...item} />
                </Col>
        ))}
        </Row>
        </>
    )
}