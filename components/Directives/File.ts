import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {NgStyle} from 'angular2/common';
import {GetSizePipe} from '../Pipes/GetSize.pipe';

@Component({
    selector: 'fileItem',
    pipes: [GetSizePipe],
    styles: [`
          .file-container {
            display: block;
            margin: 20px 5px 0 0;
            transition: opacity 0.5s, margin 0.5s linear;
            border: 1px solid #ccc;
        }

        .flex-block {
            font-size: 1em;
            margin: 2px 0;
        }
        
        .file-remove {
            cursor: pointer;
        }
        
        .file-name {
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            vertical-align: bottom;
            white-space: nowrap;
            max-width: 70%;
            margin: 5px 0 0 5px;
        }
        
        .file-preview {
            background: #ccc;
            border-radius: 2px;
            width: inherit;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            background-size: cover;
            color: #fff;
        }
        
         .file-preview-ext {
            text-transform: uppercase;
        }

        .file-progress {
            width: 70%;
            margin-left: 5%;
            display: inline;
            margin-top: 10px;
            margin-bottom: 10px;
        }

        button {
            margin: 0;
        }   
        
        .file-size{
            max-width: 20%;
            display: inline;
            color: #777;
            padding: 3px 0;
        }
        
        .remove-file, .retry, .file-remove-local {
            border: none;
            background: #f1f1f1;
            border-radius: 2px;
            color: rgba(0, 0, 0, 0.6);
            margin: 8px;
            padding: 9px;
            font-size: 12px;
            line-height: 4px;
            float: right;           
        }
        
        .remove-file:hover {
            background: #e4322b;
            color: #fff;
        } 
        
        .file-remove-local:hover{
            background: #ff6666;
            color: #fff; 
        }
        
         .retry:hover {
            background: #3399ff;
            color: #fff; 
        }    
    `],
    template: `
      <div *ngIf="file" class="file-container" [ngClass]="uploadingClass()">
            <div>
                <div class="file-name">{{fileName}}</div>
                <div class="file-size">{{file.size | getSize }} ({{ext}})</div>
                <progress [value]="percentage" max="100" class="file-progress"></progress>
              
                 <div *ngIf="uploadingClass()==='uploaded'" [ngStyle]="{display:'inline'}">
                    <button class="fa fa-times remove-file" title="Remove from Server" (click)="removeFileFromServer();" [ngStyle]="{cursor:'pointer'}"></button>
                 </div>
                 
                 <div *ngIf="uploadingClass() !='uploaded'" [ngStyle]="{display:'inline'}">
                    <button class="fa fa-times file-remove-local" title="Remove" (click)="removeFileListener();" [ngStyle]="{cursor:'pointer'}"></button>
                 </div>
                 
                <div *ngIf="uploadingClass()==='failed'" [ngStyle]="{display:'inline'}">
                    <button class="fa fa-refresh retry" title="Retry" (click)="removeFileFromServer();" [ngStyle]="{cursor:'pointer'}"></button>
                </div>
            </div>
        </div>
    `
})

export class File {
    public ext:string = '';
    public previewSrc:string = '';
    public fileName:string = '';
    //TODO: workaround - depends on strict values;
    public previewHeight:number = 75;


    //ngHooks
    ngAfterContentInit() {
        this.file && this.getFileType();
    }

    @Input() file;
    @Input() index;
    @Input() loading;
    @Input() percentage;
    @Input() uploaded;

    @Output() removeFile = new EventEmitter();
    @Output() onRemoveFileFromServer = new EventEmitter();

    public uploadingClass(){
        if(this.loading === false && this.uploaded===true){
            return "uploaded";
        } else if(this.loading === false && this.uploaded===false){
            return "failed";
        } else {
            return "";
        }
    }

    public removeFileFromServer(){
        this.onRemoveFileFromServer && this.onRemoveFileFromServer.emit(true);
    }

    removeFileListener() {
        this.removeFile && this.removeFile.emit(true);
    }

    getFileType() {
        let imageType = /^image\//,
            reader;

        if (!imageType.test(this.file.type)) {
            let ext = this.file.name.split('.').pop();

            this.fileName = this.file.name;
            this.ext = ext.length > 3
                ? 'file'
                : `.${ext}`;
            return;
        }

        reader = new FileReader();

        reader.addEventListener("load", () => {
            let img = new Image,
                result = reader.result;

            img.onload = () => {
                let ratio = img.height / img.width,
                    scaledHeight = ratio * this.previewHeight;

                this.previewSrc = result;
                this.previewHeight = (scaledHeight < this.previewHeight)
                    ? this.previewHeight
                    : scaledHeight;
            };

            img.src = result;
        }, false);

        if (this.file) {
            reader.readAsDataURL(this.file);
        }
    }
}
