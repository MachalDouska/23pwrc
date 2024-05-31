radio.setFrequencyBand(66)
radio.setTransmitPower(7)
radio.setGroup(222)
radio.setTransmitSerialNumber(true)

/* let strip = neopixel.create(DigitalPin.P0, 9, NeoPixelMode.RGB)

    strip.showColor(neopixel.rgb(0,255,0))
    strip.show()
 */

enum Pins {
    wr = DigitalPin.P8,
    wl = DigitalPin.P12,
    r = DigitalPin.P13,
    l = DigitalPin.P14,
    c = DigitalPin.P15,
    trig = DigitalPin.P2,
    echo = DigitalPin.P1
}
enum ServoDirection {
    Left = 2,
    Center = 1,
    Right = 0
}
const allIRPins: Array<number> = [Pins.wr, Pins.wl, Pins.r, Pins.l, Pins.c, Pins.trig]
for (let pin of allIRPins) {
    pins.setPull(pin, PinPullMode.PullNone);
}

const carMotor = (leftwheel: number = 0, rightwheel: number = 0): void => {
    if (leftwheel === 0 && rightwheel === 0) { PCAmotor.MotorStopAll(); return; }

    PCAmotor.MotorRun(PCAmotor.Motors.M1, -1*leftwheel)
    PCAmotor.MotorRun(PCAmotor.Motors.M4, -1*rightwheel)
}

const servoMove = (direction: ServoDirection): void => {
    PCAmotor.GeekServo(PCAmotor.Servos.S1, 500 + 1000 * direction)
    basic.pause(2000)
    PCAmotor.StopServo(PCAmotor.Servos.S1)
}

type Protokol = {
    x: number,
    y: number,
    a: boolean,
    b: boolean,
    logo: boolean
}

let encodeddata: string

function decode(encodeddata: string): Protokol {
    return {
    x: (parseInt(encodeddata.split(";")[0]))/2,
    y: (parseInt(encodeddata.split(";")[1]))/2,
    a: `1` === encodeddata.split(";")[2],
    b: `1` === encodeddata.split(";")[3],
    logo: `1`=== encodeddata.split(";")[4]
    }
}

let powerX:number
let powerY:number
let lw:number
let rw:number

function limit() {
    if (decode(encodeddata).x > 240) {powerX = 255} else {powerX=decode(encodeddata).x
    if (decode(encodeddata).x < -240) { powerX = -255 } else { powerX = decode(encodeddata).x }}
    if (decode(encodeddata).y > 240) { powerY = 255 } else { powerY = decode(encodeddata).y
    if (decode(encodeddata).y < -240) { powerY = -255 } else { powerY = decode(encodeddata).y }}
    
    lw = powerY - powerX
    rw = powerY + powerX
    
    //console.logValue("lw",lw)
    //console.logValue("rw",rw)
}

input.onButtonPressed(Button.A, function() {
    servoMove(ServoDirection.Left)
})
input.onButtonPressed(Button.B, function() {
    servoMove(ServoDirection.Right)
})
input.onButtonPressed(Button.AB, function() {
    servoMove(ServoDirection.Center)
})

//carMotor(255, 255)

radio.onReceivedString(function(receivedString: string) {
    
    encodeddata = receivedString
    //console.log(encodeddata)
    decode(encodeddata)
    if (decode(encodeddata).a) {
    limit()
    carMotor(lw, rw)
    } else {
        PCAmotor.MotorStopAll()
    }
})
