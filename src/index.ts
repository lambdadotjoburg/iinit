import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  LabShell
} from '@jupyterlab/application';

import {
  INotebookTracker,
  NotebookPanel,
  // NotebookActions,
} from '@jupyterlab/notebook';

/**
 * Initialization data for the iinit extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'iinit:plugin',
  description: 'A jupyter lab/notebook front-end extension for running/executing cells on kernel start-up',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, notebookTracker: INotebookTracker) => {
    console.log('JupyterLab extension iinit is activated!');
    // Detect whether a new notebook file has been opened
    notebookTracker.widgetAdded.connect(()=>{
      // console.log("New Notebook File Opened");
      // get the current notebook panel
      let labShell = app.shell as LabShell;
      let panel = labShell.currentWidget as NotebookPanel;
      // get the current/open notebook
      const current = notebookTracker.currentWidget
      let notebook = current?.content;
      // check if panel is defined
      if (panel) {
        panel.revealed.then(()=>{
          // console.log("Panel Revealed");
          // detect whether kernel has been loaded in jupyter shell lab
          panel!.context.sessionContext.ready.then(()=>{
            panel.context.sessionContext.session!.kernel!.connectionStatusChanged.connect(()=>{

              // if notebook metadata is set as "iinit:": true, then run all cells at startup
              let iinit = notebook?.model?.sharedModel.getMetadata("iinit");
              console.log("run all cells (notebook metadata iinit)" + iinit);

              if (iinit === true) {
                app.commands.execute('notebook:run-all-cells');
              } else {
                // retrieve all the cells from the notebook panel
                let cellList = panel.content.model?.cells;
                // iterate over all the cells in the notebook panel
                // check for cells having metadata "iinit"
                // if so, execute the cell source at startup, otherwise don't
                let l = cellList?.length; // store the number of cells (at notebook reveal)
                // check if length is defined before iterating
                if (l) {
                  for (let i = 0; i < l; i++) {
                    // if cell contains the iinit metadata then run the source code at startup
                    if (cellList?.get(i).getMetadata("iinit")) {
                      // check if notebook is defined
                      if (notebook) {
                        // set active cell
                        notebook.activeCellIndex = i;
                        // get source code from cell
                        // let source = notebook?.activeCell?.model.sharedModel.source;
                        // console.log("metadata found at cell index " + i);
                        // console.log(source);
                        // run the currently active/selected cell
                        // app.commands.execute('notebook:run-cell-and-select-next')
                        app.commands.execute('notebook:run-cell');
                      }
                    }
                  }
                }
              }

            });
          });
        });
      }      
    });

  }
};

export default plugin;
