/* eslint-disable no-undef */
const customEventElement = document.createElement('div');

window.customEventElement = customEventElement;

customEventElement.addEventListener('createUniver', (e) => {
	if(!e.detail.ref){
		console.warn('univer container',e.detail.ref);
		return;
	}
	
	queryAllUniverLink(e.detail.ref, createUniverWithCollaboration)
});


function queryAllUniverLink(ele, callback) {
	ele.querySelectorAll('a').forEach((a)=>{
		if(isUniverURL(a.href) && a.querySelector('.univer-container') === null){
			const container = document.createElement('div');
			container.style.width = '600px';
			container.style.height = '360px';
			container.classList.add('univer-container');
			a.appendChild(container);
			callback(container, a.href);
		}
	})
}

function createUniver(container, url) {
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
		UniverSheetsFormula
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

	const unitInfo = getUnitByURL(url);
	if (unitInfo) {
		const { type } = unitInfo;

		if (type === 1) {
			univer.createUnit(UniverCore.UniverInstanceType.UNIVER_DOC, {});
		} else if (type === 2) {
			univer.createUnit(UniverCore.UniverInstanceType.UNIVER_SHEET, {});
		}
	}
}

const host = window.location.host;
const isSecure = window.location.protocol === 'https:';
const httpProtocol = isSecure ? 'https' : 'http';
const wsProtocol = isSecure ? 'wss' : 'ws';

function createUniverWithCollaboration(container, url) {
	// check if the unit is already created
	const unitInfo = getUnitByURL(url);
	if (unitInfo) {
		const { type, id } = unitInfo;
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
	}

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
			UniverSheetsFormula: { UniverSheetsFormulaPlugin }
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
