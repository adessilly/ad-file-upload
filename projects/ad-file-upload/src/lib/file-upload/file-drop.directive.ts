import { Directive, ElementRef, inject, input, output } from '@angular/core';

import { FileUploader, FileUploaderOptions } from './file-uploader.class';

@Directive({
  selector: '[adFileDrop]',
  host: {
    '(drop)': 'onDrop($event)',
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave($event)'
  }
})
export class FileDropDirective {
  public readonly uploader = input.required<FileUploader>();
  public readonly fileOver = output<boolean>();
  public readonly onFileDrop = output<File[]>();

  protected element = inject(ElementRef);

  public getOptions(): FileUploaderOptions {
    return this.uploader().options;
  }

  public getFilters(): any {
    return {};
  }

  public onDrop(event: any): void {
    let transfer = this._getTransfer(event);
    if (!transfer) {
      return;
    }

    let options = this.getOptions();
    let filters = this.getFilters();
    this._preventAndStop(event);
    this.uploader().addToQueue(transfer.files, options, filters);
    this.fileOver.emit(false);
    this.onFileDrop.emit(transfer.files);
  }

  public onDragOver(event: any): void {
    let transfer = this._getTransfer(event);
    if (!this._haveFiles(transfer.types)) {
      return;
    }

    transfer.dropEffect = 'copy';
    this._preventAndStop(event);
    this.fileOver.emit(true);
  }

  public onDragLeave(event: any): any {
    if ((this as any).element) {
      if (event.currentTarget === (this as any).element[ 0 ]) {
        return;
      }
    }

    this._preventAndStop(event);
    this.fileOver.emit(false);
  }

  protected _getTransfer(event: any): any {
    return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer; // jQuery fix;
  }

  protected _preventAndStop(event: any): any {
    event.preventDefault();
    event.stopPropagation();
  }

  protected _haveFiles(types: any): any {
    if (!types) {
      return false;
    }

    if (types.indexOf) {
      return types.indexOf('Files') !== -1;
    } else if (types.contains) {
      return types.contains('Files');
    } else {
      return false;
    }
  }
}
