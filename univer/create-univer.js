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

	const { type, id } = uploadUniver(e.detail.ref, e.detail.url);

	// createUniverWithCollaboration(e.detail.ref, type, id);
});

function uploadUniver(ref, url) {
	const univerAPI = createUniverAPI();
	// Fetch the file and import it as a snapshot
	fetchExcelFile(url).then(async file => {
		if (file) {
			const {
				UniverExchangeClient: { getUniverTypeByFile },
			} = window;

			const type = getUniverTypeByFile(file);
			if(type === 1){
				univerAPI.importDOCXToUnitId(file).then(unitId => {
					createUniverWithCollaboration(ref, type, unitId);
				});
			}else if(type === 2){
				univerAPI.importXLSXToUnitId(file).then(unitId => {
					createUniverWithCollaboration(ref, type, unitId);
				});
			}
		}
	});

}


function queryAllUniverLink(ele, callback) {
	ele.querySelectorAll('a').forEach((a)=>{
		if(isUniverURL(a.href) && a.querySelector('.univer-container') === null){
			const container = document.createElement('div');
			container.style.width = '600px';
			container.style.height = '360px';
			container.classList.add('univer-container');
			a.appendChild(container);

			const unitInfo = getUnitByURL(a.href);
			if (unitInfo) {
				const { type, id } = unitInfo;
				callback(container, type, id);
			}
			
		}
	})
}

function createUniverAPI() {
	const container = document.createElement('div');
	container.style.display = 'none';
	container.style.width = '600px';
	container.style.height = '360px';
	document.body.appendChild(container);

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
		UniverExchangeClient: { UniverExchangeClientPlugin },
		UniverFacade,
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
	return UniverFacade.FUniver.newAPI(univer)
}

const host = window.location.host;
const isSecure = window.location.protocol === 'https:';
const httpProtocol = isSecure ? 'https' : 'http';
const wsProtocol = isSecure ? 'wss' : 'ws';

function createUniverWithCollaboration(container, type, id) {

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
	

	const setup = (extLocale, unitId, type) => {
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
			UniverCollaborationClient,
			UniverExchangeClient: { UniverExchangeClientPlugin },
			UniverSheetsFormula: { UniverSheetsFormulaPlugin },
			UniverFacade,
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
		configService.setConfig(AUTHZ_URL_KEY, `${httpProtocol}://${host}/universer-api/authz`);
		configService.setConfig(SNAPSHOT_SERVER_URL_KEY, `${httpProtocol}://${host}/universer-api/snapshot`);
		configService.setConfig(COLLAB_SUBMIT_CHANGESET_URL_KEY, `${httpProtocol}://${host}/universer-api/comb`);
		configService.setConfig(COLLAB_WEB_SOCKET_URL_KEY, `${wsProtocol}://${host}/universer-api/comb/connect`);

		// collaboration
		univer.registerPlugin(UniverCollaboration.UniverCollaborationPlugin);
		univer.registerPlugin(UniverCollaborationClient.UniverCollaborationClientPlugin, {
			enableAuthServer: true
		});

		univer.registerPlugin(UniverExchangeClientPlugin)

		const univerAPI = UniverFacade.FUniver.newAPI(univer)

		if (type === 1) {
			univer
				.__getInjector()
				.get(SnapshotService)
				.loadDoc(unitId, 0);
		} else if (type === 2) {
			univer
				.__getInjector()
				.get(SnapshotService)
				.loadSheet(unitId, 0);
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

// Function to fetch and convert the URL to a File object
async function fetchExcelFile(url) {
	try {
		const response = await fetch(url);
		const blob = await response.blob();
		return new File([blob], 'filename.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
	} catch (error) {
		console.error('Failed to fetch the file:', error);
	}
}

