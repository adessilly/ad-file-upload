import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileSelectDirective } from './file-upload/file-select.directive';
import { FileDropDirective } from './file-upload/file-drop.directive';

@NgModule({
  imports: [ CommonModule ],
  declarations: [ FileDropDirective, FileSelectDirective ],
  exports: [ FileDropDirective, FileSelectDirective ]
})
export class AdFileUploadModule { }
