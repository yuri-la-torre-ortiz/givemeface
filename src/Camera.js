import React, { Component } from 'react'
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { TinyFaceDetectorOptions } from 'face-api.js';



export class Camera extends Component {

        state = {
            loaded : false,
        }

    mediaHandler = () => {
        // console.log(faceapi.nets)
        const video = document.getElementById('video');
        const displaySize = {
            width : video.width,
            height : video.height
        }
        const canvas = faceapi.createCanvas({width : video.width, height : video.height});
        canvas.id = 'videoCanvas'
        document.getElementById('videoContainer').append(canvas)
        faceapi.matchDimensions(canvas,displaySize)

        

        // console.log(canvas)
        // console.log(displaySize)
        setInterval(async () => {
            const detections = await faceapi.detectSingleFace(video, new TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender()
            // .withFaceDescriptors()

            

            // detections.map((face,index) => console.log('Face #',index,'Guessed age:',face.age))
            if(detections){
                const resizedDetections = faceapi.resizeResults(detections,displaySize)
                console.log(resizedDetections)
                const drawOptions = {
                    label: `Age: ${Math.floor(detections.age)}`,
                    boxColor: 'Red',
                    lineWidth: 4,
                    drawLabelOptions: {
                        anchorPosition: 'BOTTOM_RIGHT',
                        backgroundColor: 'rgba(0, 0, 0, 1)',
                        fontColor: 'White',
                    }
                    }
    
                const box = { 
                    x: resizedDetections.detection.box.x,
                    y: resizedDetections.detection.box.y, 
                    width: resizedDetections.detection.box.width, 
                    height: resizedDetections.detection.box.height,
                }
    
                const drawBox = new faceapi.draw.DrawBox(box, drawOptions)
    
                

                canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height)
                drawBox.draw(canvas,resizedDetections)
                const minConfidence = 0.5
                faceapi.draw.drawFaceExpressions(canvas,resizedDetections,minConfidence)
                faceapi.draw.drawFaceLandmarks(canvas,resizedDetections)
            }
        }, 150 )
    }

    componentDidMount = () => {
        Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                faceapi.nets.faceExpressionNet.loadFromUri('/models'),
                faceapi.nets.tinyYolov2.loadFromUri('/models'),
                faceapi.nets.ageGenderNet.loadFromUri('/models')
            ])
            .then(this.setState({
                loaded : true
            }))
    }


    render() {
        const videoConstraints = {
            width : window.screen.width * .7,
            height : window.screen.width / 2,
            facingMode : 'user'
        };

        // console.log(this.state)
        return (
            <div id = 'videoContainer'>
                {
                this.state.loaded ?
                    <Webcam
                        id = 'video'
                        width = {videoConstraints.width}
                        height = {videoConstraints.height}
                        audio={false}
                        videoConstraints={videoConstraints}
                        onUserMedia={this.mediaHandler}
                    ></Webcam>
                :
                null
                }
            </div>
        )
    }
}

export default Camera