import { ICollaborativeDrive } from '@jupyter/collaborative-drive';
import {
  JupyterGISPanel,
  JupyterGISDocumentWidget,
  ToolbarWidget,
} from '@jupytergis/base';
import {
  JupyterGISModel,
  IJupyterGISTracker,
  IJGISExternalCommandRegistry,
} from '@jupytergis/schema';
import { IEditorMimeTypeService } from '@jupyterlab/codeeditor';
import { ConsolePanel, IConsoleTracker } from '@jupyterlab/console';
import { ABCWidgetFactory, DocumentRegistry } from '@jupyterlab/docregistry';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { Contents, ServiceManager } from '@jupyterlab/services';
import { CommandRegistry } from '@lumino/commands';

interface IOptions extends DocumentRegistry.IWidgetFactoryOptions {
  tracker: IJupyterGISTracker;
  commands: CommandRegistry;
  externalCommandRegistry: IJGISExternalCommandRegistry;
  manager?: ServiceManager.IManager;
  contentFactory?: ConsolePanel.IContentFactory;
  mimeTypeService?: IEditorMimeTypeService;
  rendermime?: IRenderMimeRegistry;
  consoleTracker?: IConsoleTracker;
  backendCheck?: () => boolean;
  drive?: ICollaborativeDrive | null;
}

export class JupyterGISDocumentWidgetFactory extends ABCWidgetFactory<
  JupyterGISDocumentWidget,
  JupyterGISModel
> {
  constructor(private options: IOptions) {
    const { backendCheck, externalCommandRegistry, ...rest } = options;
    super(rest);
    this._backendCheck = backendCheck;
    this._commands = options.commands;
    this._externalCommandRegistry = externalCommandRegistry;
    this._contentsManager = options.manager?.contents;
  }

  /**
   * Create a new widget given a context.
   *
   * @param context Contains the information of the file
   * @returns The widget
   */
  protected createNewWidget(
    context: DocumentRegistry.IContext<JupyterGISModel>,
  ): JupyterGISDocumentWidget {
    if (this._backendCheck) {
      const checked = this._backendCheck();
      if (!checked) {
        throw new Error('Requested backend is not installed');
      }
    }
    const { model } = context;
    model.filePath = context.localPath;
    if (this._contentsManager) {
      model.contentsManager = this._contentsManager;
    }
    const content = new JupyterGISPanel({
      model,
      manager: this.options.manager,
      contentFactory: this.options.contentFactory,
      mimeTypeService: this.options.mimeTypeService,
      rendermime: this.options.rendermime,
      consoleTracker: this.options.consoleTracker,
      commandRegistry: this.options.commands,
    });
    const toolbar = new ToolbarWidget({
      commands: this._commands,
      model,
      externalCommands: this._externalCommandRegistry.getCommands(),
    });
    return new JupyterGISDocumentWidget({ context, content, toolbar });
  }

  private _commands: CommandRegistry;
  private _externalCommandRegistry: IJGISExternalCommandRegistry;
  private _backendCheck?: () => boolean;
  private _contentsManager?: Contents.IManager | null;
}
