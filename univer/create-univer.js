/* eslint-disable no-undef */
const customEventElement = document.createElement('div');

window.customEventElement = customEventElement;

customEventElement.addEventListener('createUniverAll', (e) => {
	if(!e.detail.ref){
		console.warn('univer container',e.detail.ref);
		return;
	}
	
	queryAllUniverLink(e.detail.ref, createUniverWithCollaboration)
});

customEventElement.addEventListener('createUniverUpload', (e) => {
	if(!e.detail.ref){
		console.warn('univer container', e.detail.ref);
		return;
	}

	if(e.detail.ref === 'dialog'){
		showDialog();
		const container = document.querySelector('#file-preview-overlay .dialog-univer-container');
		handleFile(container, e.detail.url);
		// createUniver(container); // offline test
	}else{
		uploadUniver(e.detail.ref, e.detail.url);
	}
	// createUniver(e.detail.ref); // offline test
});


initDialogDOM();


function uploadUniver(ref, url) {
	// Fetch the file and import it as a snapshot
	getFileByURL(url).then(async file => {
		if (file) {
			handleFile(ref, file);
		}
	});
	
}

function handleFile(ref,file){
	const {
		UniverExchangeClient: { getUniverTypeByFile },
	} = window;

	const type = getUniverTypeByFile(file);

	const exchangeService = createUniver();
	exchangeService.importFileToUnitId(file, type).then(unitId => {
		createUniverWithCollaboration(ref, type, unitId);
	})
}

function queryAllUniverLink(ele, callback) {
	ele.querySelectorAll('a').forEach((a)=>{
		if(isUniverURL(a.href) && !a.nextElementSibling?.classList.contains('univer-container')){
			a.insertAdjacentHTML('afterend',`<div class="univer-container univer-theme" style="width: 600px;height: 360px;background: #eee;display: flex;align-items: center;justify-content: center;"><i class="icon-spinner animated" style="width: 40px;height: 40px;border-width: 6px;"></i></div>`);
			const container = a.nextElementSibling;
			const unitInfo = getUnitByURL(a.href);
			if (unitInfo) {
				const { type, id } = unitInfo;
				callback(container, type, id);
			}
			
		}
	})
}

function createUniver(container) {
	if(!container){
		container = document.createElement('div');
		container.style.display = 'none';
		container.style.width = '600px';
		container.style.height = '360px';
		document.body.appendChild(container);
	}

	const {
		UniverCore,
		UniverDesign,
		UniverEngineRender,
		UniverEngineFormula,
		UniverDocs,
		UniverDocsUi,
		UniverUi,
		UniverSheets,
		UniverSheetsUi,
		UniverSheetsNumfmt,
		UniverSheetsFormula,
		UniverExchangeClient: { UniverExchangeClientPlugin, IExchangeService },
		// UniverFacade,
	} = window;

	const univer = new UniverCore.Univer({
		theme: UniverDesign.defaultTheme,
		locale: UniverCore.LocaleType.EN_US,
		locales: {
			[UniverCore.LocaleType.EN_US]: UniverUMD['en-US']
		}
	});

	univer.registerPlugin(UniverEngineRender.UniverRenderEnginePlugin);
	univer.registerPlugin(UniverEngineFormula.UniverFormulaEnginePlugin);

	univer.registerPlugin(UniverUi.UniverUIPlugin, {
		container,
		header: true,
		footer: false
	});

	univer.registerPlugin(UniverDocs.UniverDocsPlugin, {
		hasScroll: false
	});
	univer.registerPlugin(UniverDocsUi.UniverDocsUIPlugin);

	univer.registerPlugin(UniverSheets.UniverSheetsPlugin);
	univer.registerPlugin(UniverSheetsUi.UniverSheetsUIPlugin);
	univer.registerPlugin(UniverSheetsNumfmt.UniverSheetsNumfmtPlugin);
	univer.registerPlugin(UniverSheetsFormula.UniverSheetsFormulaPlugin);

	univer.registerPlugin(UniverExchangeClientPlugin)

	univer.createUnit(UniverCore.UniverInstanceType.UNIVER_SHEET, {});
	return univer.__getInjector().get(IExchangeService);
}

const host = 'dev.univer.plus' || window.location.host;
const isSecure = window.location.protocol === 'https:';
const httpProtocol = isSecure ? 'https' : 'http';
const wsProtocol = isSecure ? 'wss' : 'ws';

async function createUniverWithCollaboration(container, type, id) {

	Promise.all([
		fetch('https://unpkg.com/@univerjs-pro/collaboration-client/lib/locale/en-US.json').then((res) => res.json())
	]).then(([collaborationLocale]) => {
		setup(
			{
				...collaborationLocale
			},
			id,
			type
		);
	});
	

	const setup = async (extLocale, unitId, type) => {
		const {
			UniverCore,
			UniverDesign,
			UniverEngineRender,
			UniverEngineFormula,
			UniverDocs,
			UniverDocsUi,
			UniverUi,
			UniverSheets,
			UniverSheetsUi,
			UniverCollaboration,
			UniverCollaborationClient: {ANONYMOUS_LOGIN_URL},
			UniverExchangeClient: { UniverExchangeClientPlugin, EXCHANGE_UPLOAD_FILE_SERVER_URL_KEY, EXCHANGE_IMPORT_SERVER_URL_KEY, EXCHANGE_EXPORT_SERVER_URL_KEY, EXCHANGE_GET_TASK_SERVER_URL_KEY, EXCHANGE_SIGN_URL_SERVER_URL_KEY },
			UniverSheetsFormula: { UniverSheetsFormulaPlugin },
		} = window;

		const { SnapshotService } = UniverCollaboration;
		const { Tools } = UniverCore;

		const univer = new UniverCore.Univer({
			theme: UniverDesign.defaultTheme,
			locale: UniverCore.LocaleType.EN_US,
			locales: {
				[UniverCore.LocaleType.EN_US]: Tools.deepMerge(UniverUMD['en-US'], extLocale)
			},
			override: [
				[UniverCore.IAuthzIoService, null],
				[UniverCore.IUndoRedoService, null]
			]
		});
		univer.registerPlugin(UniverDocs.UniverDocsPlugin, {
			hasScroll: false
		});

		univer.registerPlugin(UniverEngineRender.UniverRenderEnginePlugin);
		univer.registerPlugin(UniverEngineFormula.UniverFormulaEnginePlugin);
		univer.registerPlugin(UniverSheetsFormulaPlugin);

		univer.registerPlugin(UniverUi.UniverUIPlugin, {
			container,
			header: false,
			footer: false
		});

		univer.registerPlugin(UniverDocsUi.UniverDocsUIPlugin);

		univer.registerPlugin(UniverSheets.UniverSheetsPlugin);
		univer.registerPlugin(UniverSheetsUi.UniverSheetsUIPlugin);

		//   pro
		const injector = univer.__getInjector();
		const configService = injector.get(UniverCore.IConfigService);

		// debug via reverse proxy
		const {
			SNAPSHOT_SERVER_URL_KEY,
			COLLAB_SUBMIT_CHANGESET_URL_KEY,
			COLLAB_WEB_SOCKET_URL_KEY,
			AUTHZ_URL_KEY
		} = UniverCollaborationClient;

		// config collaboration endpoint
		configService.setConfig(ANONYMOUS_LOGIN_URL, `${httpProtocol}://${host}/universer-api/anonymous`);
		configService.setConfig(AUTHZ_URL_KEY, `${httpProtocol}://${host}/universer-api/authz`);
		configService.setConfig(SNAPSHOT_SERVER_URL_KEY, `${httpProtocol}://${host}/universer-api/snapshot`);
		configService.setConfig(COLLAB_SUBMIT_CHANGESET_URL_KEY, `${httpProtocol}://${host}/universer-api/comb`);
		configService.setConfig(COLLAB_WEB_SOCKET_URL_KEY, `${wsProtocol}://${host}/universer-api/comb/connect`);

		configService.setConfig(EXCHANGE_UPLOAD_FILE_SERVER_URL_KEY, `${httpProtocol}://${host}/universer-api/stream/file/upload`);
		configService.setConfig(EXCHANGE_IMPORT_SERVER_URL_KEY, `${httpProtocol}://${host}/universer-api/exchange/{type}/import`);
		configService.setConfig(EXCHANGE_EXPORT_SERVER_URL_KEY, `${httpProtocol}://${host}/universer-api/exchange/{type}/export`);
		configService.setConfig(EXCHANGE_GET_TASK_SERVER_URL_KEY, `${httpProtocol}://${host}/universer-api/exchange/task/{taskID}`);
		configService.setConfig(EXCHANGE_SIGN_URL_SERVER_URL_KEY, `${httpProtocol}://${host}/universer-api/file/{fileID}/sign-url`);

		// collaboration
		univer.registerPlugin(UniverCollaboration.UniverCollaborationPlugin);
		univer.registerPlugin(UniverCollaborationClient.UniverCollaborationClientPlugin, {
			enableAuthServer: true
		});
		
		univer.registerPlugin(UniverExchangeClientPlugin)

		// Define the URL
		// const url = `${httpProtocol}://${host}/universer-api/anonymous`;
		// anonymousLogin(url, () => {
		// 	if (type === 1) {
		// 		univer
		// 			.__getInjector()
		// 			.get(SnapshotService)
		// 			.loadDoc(unitId, 0);
		// 	} else if (type === 2) {
		// 		univer
		// 			.__getInjector()
		// 			.get(SnapshotService)
		// 			.loadSheet(unitId, 0);
		// 	}
		// });

		if (type === 1) {
			await univer
				.__getInjector()
				.get(SnapshotService)
				.loadDoc(unitId, 0)
		} else if (type === 2) {
			await univer
				.__getInjector()
				.get(SnapshotService)
				.loadSheet(unitId, 0)
		}

		if(container.style.display === 'flex'){
			removeSpinner(container);
			container.style.display = 'block';
		}
		
	};
}

function getUnitByURL(url) {
	// Define a regular expression to match URLs with univer.ai and univer.plus domain names
	const regex = /https:\/\/(?:[\w.-]+\.)?univer\.(ai|plus)\/unit\/(\d+)\/([a-zA-Z0-9_-]+)/;
	const match = url.match(regex);

	if (match) {
		const type = Number.parseInt(match[2], 10);
		const id = match[3];
		return { type, id };
	}

	return null;
}

function isUniverURL(url) {
	// Define a regular expression to match URLs with univer.ai and univer.plus domain names
	const regex = /https:\/\/(?:[\w.-]+\.)?univer\.(ai|plus)\/unit\/(\d+)\/([a-zA-Z0-9_-]+)/;
	const match = url.match(regex);

	if (match) {
		const type = Number.parseInt(match[2], 10);
		const id = match[3];
		return { type, id };
	}

	return null;
}

async function getFileByURL(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.blob();
        const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
        const filename = getFileNameFromURL(url) || 'file';
        const file = new File([data], filename, { type: contentType });
        return file;
    } catch (error) {
        console.error('Error fetching file from URL:', error);
        return undefined;
    }
}

function getFileNameFromURL(url) {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    return pathSegments.pop();
}

function initDialogDOM(params) {
    if(!window.initDialog){

        window.initDialog = true

        let styles = `
        #file-preview-overlay {
            position: fixed;
            top: 0;
            left: 0;
			z-index: 9999;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            justify-content: center;
            align-items: center;
        }
        #dialog {
            background: #fff;
            padding: 20px;
            border-radius: 5px;
            position: relative;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            width: 95%;
    		height: 90%;
            text-align: center;
        }
        #dialog h2 {
            margin-top: 0;
        }
		.dialog-univer-container{
			height: calc(100% - 120px);
			border: 1px solid rgba(var(--grey-300));
    		border-radius: 8px;
    		padding: 4px 0 4px 0;
		}
        .close-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
        }
        .confirm-btn {
            margin-top: 20px;
            padding: 8px 20px;
        }
            `

		 let styleSheet = document.createElement("style")
		 styleSheet.innerText = styles
		 document.head.appendChild(styleSheet)

         const dialog = `<div id="file-preview-overlay">
			<div id="dialog">
				<button class="close-btn">✖</button>
				<h2>Univer Preview</h2>
				<div class="dialog-univer-container"></div>
				<button class="confirm-btn btn btn-large btn-success">OK</button>
			</div>
		</div>`

        document.body.insertAdjacentHTML('beforeend',dialog)

        initDialogEvent()
            
    }
}

function initDialogEvent() {
    const closeBtn = document.querySelector("#file-preview-overlay .close-btn");
    const confirmBtn = document.querySelector("#file-preview-overlay .confirm-btn");
  
    closeBtn.addEventListener("click", () => {
		hideDialog()
    });
  
    confirmBtn.addEventListener("click", () => {
		hideDialog()
    });
  }

function showDialog(){
	const overlay = document.querySelector("#file-preview-overlay");
	overlay.style.display = "flex";
}

function hideDialog(){
	const overlay = document.querySelector("#file-preview-overlay");
	overlay.style.display = "none";
}


function createFingerprint() {
    if (!typeof window) {
        return '';
    }

    function bin2hex(s) {
        let i;
        let l;
        let n;
        let o = '';
        s += '';
        for (i = 0, l = s.length; i < l; i++) {
            n = s.charCodeAt(i).toString(16);
            o += n.length < 2 ? `0${n}` : n;
        }
        return o;
    }
    const canvas = window.document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const txt = window.location.host;
    if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px \'Arial\'';
    // @ts-expect-error
        ctx.textBaseline = 'tencent';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText(txt, 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText(txt, 4, 17);
    }
    const b64 = canvas.toDataURL().replace('data:image/png;base64,', '');
    const bin = atob(b64);
    const fingerprint = bin2hex(bin.slice(-16, -12));
    return fingerprint;
}



function anonymousLogin(url,callback){

// Define the request parameters
const params = {
  deviceID: createFingerprint()
};

// Make the fetch request
fetch(url, {
  method: 'POST', // Use POST method to send data
  headers: {
    'Content-Type': 'application/json' // Set the content type to JSON
  },
  body: JSON.stringify(params) // Convert the parameters to a JSON string
})
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok ' + response.statusText);
  }
  return response.json(); // Parse the JSON response
})
.then(data => {
  console.log('Success:', data); // Log the response data
  callback()
})
.catch(error => {
  console.error('Error:', error); // Log any errors
});

}

function removeSpinner(container){
	const spinner = container.querySelector('.icon-spinner');
	if(spinner){
		spinner.remove();
	}
}