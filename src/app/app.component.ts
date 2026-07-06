import { Component, signal } from '@angular/core';
import { FileDropDirective, FileItem, FileSelectDirective, FileUploader } from 'ad-file-upload';

@Component({
  selector: 'app-root',
  imports: [FileDropDirective, FileSelectDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  protected readonly title = signal('ad-file-upload-project');
  protected readonly fileOver = signal(false);
  protected readonly queue = signal<FileItem[]>([]);

  protected readonly uploader = new FileUploader({ url: '/upload' });

  public constructor() {
    // Les callbacks du FileUploader sont hors du graphe réactif d'Angular :
    // on resynchronise le signal `queue` pour déclencher le rendu (zoneless).
    this.uploader.onAfterAddingAll = () => this.refreshQueue();
    this.uploader.onProgressItem = () => this.refreshQueue();
    this.uploader.onCompleteItem = () => this.refreshQueue();
  }

  protected refreshQueue(): void {
    this.queue.set([...this.uploader.queue]);
  }
}
