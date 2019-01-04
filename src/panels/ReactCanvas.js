import React from "react";
import imageStart from '../img/phone.png'
import {
  Div,
  Group,
  FormLayout,
  File
} from '@vkontakte/vkui';
import Icon24Camera from '@vkontakte/icons/dist/24/camera';
import './Canvas.css'


class ReactCanvas extends React.Component {

    constructor(props) {
      super(props);
      this.state = {

        myImage: this.props.selectedImage ? this.props.selectedImage : imageStart
      };
      this.canvas=null;
      this.ctx=null;
      this.ctxImage = new Image();
      this.onImageChange = this.onImageChange.bind(this);



    }

    componentDidMount() {
      const canvasWidth = window.innerWidth - 40;
      const fontSize = canvasWidth * 0.1;
      this.ctxImage.onload = () => {
        this.fontSize = fontSize;
        this.canvas = document.getElementById('memesCanvas');
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasWidth;
        this.ctx = this.canvas.getContext('2d');
        this.canvasDrow(this.ctxImage)
        this.ctx.font = `${fontSize}px Impact`;
        this.ctx.fillStyle = 'white';
        this.ctx.textBaseline = "hanging";
        this.ctx.textAlign = "center";
        this._redrawCanvas();
      };
      this.ctxImage.src = this.state.myImage;

    }

    componentDidUpdate() {
      const canvasWidth = window.innerWidth - 40;
      this.ctxImage.src = this.state.myImage;
      const fontSize = canvasWidth * 0.1;
      this.fontSize = fontSize;
      this.ctx.font = `${fontSize}px Impact`;
      this.ctx.fillStyle = 'white';
      this.ctx.textBaseline = "hanging";
      this.ctx.textAlign = "center";
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this._redrawCanvas();
    }

    _redrawCanvas() {
      this.ctx.drawImage(this.ctxImage, 0, 0, this.canvas.width, this.canvas.height);
      this.wrapText(this.ctx, this.props.topText, this.canvas.width * 0.5, 10, this.canvas.width, this.fontSize, false);
      this.wrapText(this.ctx, this.props.lowText, this.canvas.width * 0.5, this.canvas.height - 10 - this.fontSize, this.canvas.width, this.fontSize, true);

    }



    wrapText(context, text, x, y, maxWidth, lineHeight, fromBottom) {

      var pushMethod = (fromBottom) ? 'unshift' : 'push';

      lineHeight = (fromBottom) ? -lineHeight : lineHeight;

      var lines = [];
      //var y = y;
      var line = '';
      var words = text.split(' ');

      for (var n = 0; n < words.length; n++) {
        var testLine = line + ' ' + words[n];
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;

        if (testWidth > maxWidth) {
          lines[pushMethod](line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines[pushMethod](line);

      for (var k in lines) {
        this.ctx.strokeText(lines[k], x, y + lineHeight * k);
        this.ctx.fillText(lines[k], x, y + lineHeight * k);
      }


    }
    canvasDrow(img) {
      let rotate = this.canvas.width / img.width;
      let imgHeight = rotate * img.height;
      this.canvas.height = imgHeight;


      this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)

    }

    onImageChange(event) {

      let reader = new FileReader();
      reader.onload = (e) => {
        let img = new Image();
        img.onload = (e) => {
          this.canvasDrow(img)

        }
        img.src = e.target.result;
        this.setState({
          myImage: e.target.result
        });


      };
      reader.readAsDataURL(event.target.files[0]);

    }


  render() {
    return (
      <Div>
      <Group title="Ваш мем">
      <canvas id='memesCanvas' />
      </Group>
      <FormLayout>
        <File top="Загрузите картинку" before={<Icon24Camera />} size="xl" onChange={this.onImageChange}>
          Открыть галерею
        </File>
      </FormLayout>
      </Div>
    );
  }
}

export default ReactCanvas;