import { Directive, ElementRef, inject, input, output } from '@angular/core';

import { FileUploader } from './file-uploader.class';

@Directive({
  selector: '[adFileSelect]',
  host: {
    '(change)': 'onChange()'
  }
})
export class FileSelectDirective {
  public readonly uploader = input.required<FileUploader>();
  public readonly onFileSelected = output<File[]>();

  protected element = inject<ElementRef<HTMLInputElement>>(ElementRef);

  public getOptions(): any {
    return this.uploader().options;
  }

  public getFilters(): any {
    return {};
  }

  public isEmptyAfterSelection(): boolean {
    return !!this.element.nativeElement.attributes.getNamedItem('multiple');
  }

  public onChange(): any {
    let files = this.element.nativeElement.files;
    if (!files) {
      return;
    }
    let options = this.getOptions();
    let filters = this.getFilters();

    this.uploader().addToQueue(Array.from(files), options, filters);
    this.onFileSelected.emit(Array.from(files));

    if (this.isEmptyAfterSelection()) {
      this.element.nativeElement.value = '';
    }
  }
}
