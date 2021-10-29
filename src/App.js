import React, { useRef, useEffect, useState } from "react";
import WebViewer from "@pdftron/webviewer";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper from "@material-ui/core/Paper";
import Draggable from "react-draggable";
import "./App.css";

const App = () => {
  const viewer = useRef(null);
  const [open, setOpen] = useState(false);
  const [annotManager, setAnnotManager] = useState(null);
  const [annotationId, setAnootationId] = useState(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getAnnotation = (a, b) => {
    console.log(a, b);
    // const pop = annotManager.getAnnotationFromPopup('annotationPopup')
    handleClickOpen();
  };

  const deleteAnnotation = () => {
    // const annots = annotManager.getAnnotationsList();
    const id = annotManager.getAnnotationById(annotationId);
    // remove annotations
    annotManager.deleteAnnotation(id);
    handleClose();
  };

  useEffect(() => {
    WebViewer(
      {
        path: "/webviewer/lib",
        initialDoc: "/files/pdftron_about.pdf",
      },
      viewer.current
    ).then((instance) => {
      const { Core, UI } = instance;
      const { documentViewer, annotationManager, Tools, Annotations } = Core;

      const annotManager = documentViewer.getAnnotationManager();
      setAnnotManager(annotManager);
      console.log(instance.annotationPopup.getItems());

      const CustomStampCreateTool = function(docViewer) {
        Tools.GenericAnnotationCreateTool.call(
          this,
          docViewer,
          Annotations.StampAnnotation
        );
      };
      CustomStampCreateTool.prototype = new Tools.GenericAnnotationCreateTool();
      CustomStampCreateTool.prototype.mouseLeftDown = function() {
        Tools.AnnotationSelectTool.prototype.mouseLeftDown.apply(
          this,
          arguments
        );
      };
      CustomStampCreateTool.prototype.mouseMove = function() {
        Tools.AnnotationSelectTool.prototype.mouseMove.apply(this, arguments);
      };
      CustomStampCreateTool.prototype.mouseLeftUp = function(e) {
        const stampsAnnotation = [];
        const totalPage = documentViewer.getPageCount();
        const iterArray = Array.from({ length: totalPage }, (_, i) => i + 1);

        for (let i = 0; i < iterArray.length; i++) {
          instance.Core.Tools.GenericAnnotationCreateTool.prototype.mouseLeftDown.call(
            this,
            e
          );

          const stampAnnot = this.annotation;

          stampAnnot.PageNumber = iterArray[i];

          stampAnnot.setImageData(
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACjSURBVHgBZU+xDcIwEPQli5AtEJXTInagDjTAAnkvkFSQSaDFVNCyAUzynIUcOc5LL8v39/d3OLrLFgaLrm2cyerghhZGP4WqVmw5EZgRiLOr8uVvfmnXIC6remOe/voYCUZdJ3vBuClnfhDUPNtGQphhckKGO4eWsO+lqSNeZCbtX0lt6rGYmOSJXna18k3DIDeZewQgJZNVlHunhFAxNVW/P0IIYLS9kwjzAAAAAElFTkSuQmCC"
          );
          stampAnnot.Width = 50;
          stampAnnot.Height = 50;

          // stampAnnot.Author = annotManager.getCurrentUser();
          // stampAnnot.Locked = false;
          // stampAnnot.LockedContents = false;
          // stampAnnot.ReadOnly = false;
          // stampAnnot.NoView = false;
          // stampAnnot.ToggleNoView = false;
          // annotManager.addAnnotation(stampAnnot);
          // annotManager.redrawAnnotation(stampAnnot);
          stampsAnnotation.push(stampAnnot);
          instance.Core.Tools.GenericAnnotationCreateTool.prototype.mouseLeftUp.call(
            this,
            e
          );
        }
 

        // Tools.GenericAnnotationCreateTool.prototype.mouseLeftDown.call(this, e);
        // if (this.annotation) {
        //   this.annotation.setImageData(
        //     "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACjSURBVHgBZU+xDcIwEPQli5AtEJXTInagDjTAAnkvkFSQSaDFVNCyAUzynIUcOc5LL8v39/d3OLrLFgaLrm2cyerghhZGP4WqVmw5EZgRiLOr8uVvfmnXIC6remOe/voYCUZdJ3vBuClnfhDUPNtGQphhckKGO4eWsO+lqSNeZCbtX0lt6rGYmOSJXna18k3DIDeZewQgJZNVlHunhFAxNVW/P0IIYLS9kwjzAAAAAElFTkSuQmCC"
        //   );
        //   this.annotation.Width = 50;
        //   this.annotation.Height = 50;
        //   annotation = this.annotation;
        // }
        // Tools.GenericAnnotationCreateTool.prototype.mouseLeftUp.call(this, e);

        // if (annotation) {
        //   instance.Core.documentViewer
        //     .getAnnotationManager()
        //     .redrawAnnotation(annotation);
        // }

        annotManager.addAnnotations(stampsAnnotation);
        annotManager.drawAnnotationsFromList(stampsAnnotation).then(() => {
          documentViewer.refreshAll();
        });
      };

      const stampToolName = "AnnotationCreateCustomStamp";
      const stampTool = new CustomStampCreateTool(instance.Core.documentViewer);
      const data = "https://www.pdftron.com/favicon-200.png";
      instance.UI.registerTool({
        toolObject: stampTool,
        toolName: stampToolName,
        buttonImage: data,
        buttonName: "anything",
      });

      instance.UI.setHeaderItems((header) => {
        header
          .getHeader("toolbarGroup-Shapes")
          .get("freeHandToolGroupButton")
          .insertBefore({
            type: "toolButton",
            toolName: stampToolName,
          });
      });

      annotManager.addEventListener(
        "annotationChanged",
        (annotations, action, { imported }) => {
          // If annotation change is from import, return
          if (imported) {
            return;
          }

          annotManager.exportAnnotCommand().then((xfdfString) => {
            console.log(xfdfString);
            if (action === "add") {
            } else if (action === "modify") {
            } else if (action === "delete") {
              console.log("here");
            }
          });
        }
      );

      annotManager.on("annotationSelected", (annotations, action) => {
        if (action === "selected") {
          console.log("annotation selection");
          setAnootationId(annotations[0].Id);
        } else if (action === "deselected") {
          console.log("annotation deselection");
          setAnootationId(null);
        }

        console.log("annotation list", annotations);

        if (annotations === null && action === "deselected") {
          console.log("all annotations deselected");
        }
      });

      // customzing the delete annotation button
      instance.updateElement("annotationDeleteButton", {
        onClick: (e) => getAnnotation(e),
      });

      documentViewer.on("documentLoaded", () => {
        const rectangleAnnot = new Annotations.RectangleAnnotation();
        rectangleAnnot.PageNumber = 1;
        // values are in page coordinates with (0, 0) in the top left
        rectangleAnnot.X = 100;
        rectangleAnnot.Y = 150;
        rectangleAnnot.Width = 200;
        rectangleAnnot.Height = 50;
        rectangleAnnot.Author = annotManager.getCurrentUser();
        rectangleAnnot.Id = "uid2";

        annotManager.addAnnotation(rectangleAnnot);
        // need to draw the annotation otherwise it won't show up until the page is refreshed
        annotManager.redrawAnnotation(rectangleAnnot);

        const freeText = new Annotations.FreeTextAnnotation();
        freeText.PageNumber = 1;
        freeText.X = 300;
        freeText.Y = 200;
        freeText.Width = 300;
        freeText.Height = 200;
        freeText.setPadding(new Annotations.Rect(0, 0, 0, 0));
        freeText.setContents("My Text");
        freeText.FillColor = new Annotations.Color(0, 255, 255);
        freeText.FontSize = "16pt";
        freeText.Id = "uid1";

        annotManager.addAnnotation(freeText);
        annotManager.redrawAnnotation(freeText);
      });

      instance.setAnnotationContentOverlayHandler((annotation) => {
        const div = document.createElement("div");
        var boldElt = document.createElement("b");
        boldElt.appendChild(
          document.createTextNode(
            `${
              annotation.getCustomData("rule_index")
                ? annotation.getCustomData("rule_index")
                : "Manual"
            }`
          )
        );
        div.appendChild(boldElt);
        div.appendChild(document.createElement("br"));
        div.appendChild(document.createTextNode(`${annotation.getContents()}`));
        return div;
      });
    });
  }, []);

  function PaperComponent(props) {
    return (
      <Draggable
        handle="#draggable-dialog-title"
        cancel={'[class*="MuiDialogContent-root"]'}
      >
        <Paper {...props} />
      </Draggable>
    );
  }

  return (
    <div className="App">
      <div className="header">React sample</div>
      <div className="webviewer" ref={viewer}></div>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
          Subscribe
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to delete this annotation.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={deleteAnnotation} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default App;
