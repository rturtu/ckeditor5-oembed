import imageIcon from "./desktop-svgrepo-com.svg";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
/*
import oembedProviders from "./providers";
import matchUrl from "match-url-wildcard";
*/

class CKEditor5Oembed extends Plugin {
    static get pluginName() {
        return "Oembed";
    }

    init() {
        /*
        const getProviderEndpoint = (mediaUrl) => {
            const provider = oembedProviders.find((provider) =>
                provider.endpoints.some((endpoint) =>
                    matchUrl(mediaUrl, endpoint.schemes)
                )
            );
            if (!provider) return undefined;
            const endpoint = provider.endpoints.find((endpoint) =>
                matchUrl(mediaUrl, endpoint.schemes)
            );
            if (!endpoint) return;
            return endpoint;
        };
        const removeDotFormatFromUrl = (url) => {
            if (url.endsWith(".{format}")) {
                return url.slice(0, url.length - 9);
            } else return url;
        };
        */
        const addToEditor = (content) => {
            editor.model.change((writer) => {
                const responseView = editor.data.processor.toView(content);
                const responseModel = editor.data.toModel(responseView);
                editor.model.insertContent(
                    responseModel,
                    editor.model.document.selection
                );
            });
        };

        const addUrlToEditor = (url) => {
            addToEditor(`<a target="_blank" href="${url}">${url}</a>`);
        };

        const isUrl = (url) => {
            let urlObj;
            try {
                urlObj = new URL(url);
            } catch (_) {
                return false;
            }
            return urlObj.protocol === "http:" || urlObj.protocol === "https:";
        };

        const editor = this.editor;

        editor.ui.componentFactory.add("oembedUrl", (locale) => {
            const view = new ButtonView(locale);

            view.set({
                label: "Insert oembed",
                icon: imageIcon,
                tooltip: true,
            });

            // Callback executed once the toolbar item is clicked.
            view.on("execute", () => {
                const mediaUrl = prompt("Media URL");
                if (!mediaUrl) return;
                if (!isUrl(mediaUrl) && mediaUrl.startsWith(`<iframe`)) {
                    addToEditor(mediaUrl);
                    return;
                } else if (isUrl(mediaUrl)) {
                    fetch(`/api/OEmbed/GetUrl?url=${mediaUrl}`)
                        .then((response) => response.text())
                        .then((response) => {
                            try {
                                const jsonResponse = JSON.parse(response);
                                if (jsonResponse && jsonResponse.html)
                                    addToEditor(jsonResponse.html);
                                else addUrlToEditor(mediaUrl);
                            } catch (e) {
                                addUrlToEditor(mediaUrl);
                            }
                        })
                        .catch((err) => {
                            addUrlToEditor(mediaUrl);
                        });
                } else {
                    addToEditor(mediaUrl);
                }
            });

            return view;
        });
    }
}

export default CKEditor5Oembed;
