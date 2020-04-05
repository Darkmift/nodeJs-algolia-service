const algoliasearch = require('algoliasearch');
const Logger = require('./logger.service');
const config = require('../config/index');

const addEntryToAlgolia = async (
	entryObj,
	algolia_index_name,
	update = false,
	updateKeyVal = { searchKey: null, searchValue: null, mongoId: null },
) => {
	try {
		// return;
		const client = algoliasearch(config.ALGOLIA_APPLICATION_ID, config.ALGOLIA_API_KEY);
		const index = client.initIndex(algolia_index_name);
		let resultRef = null;
		if (!update) {
			resultRef = await index.saveObject(entryObj, {
				autoGenerateObjectIDIfNotExist: true,
			});
			Logger.info('addEntryToAlgolia->result', resultRef);
			return resultRef;
		}

		if (!updateKeyVal || !updateKeyVal.mongoId) {
			Logger.error('addEntryToAlgolia -> error', 'missing params in update');
			return null;
		}

		const { searchKey, searchValue, mongoId } = updateKeyVal;

		resultRef = await index.findObject((target) => target.mongoId == mongoId);

		if (!resultRef) {
			Logger.error('addEntryToAlgolia -> error', 'findObject no result');
			return null;
		}
		const { objectID } = resultRef.object;
		const partialUpdateObj = { [searchKey]: searchValue, objectID };
		updateObjRef = await index.partialUpdateObject(partialUpdateObj, {
			// All the following parameters are optional
			createIfNotExists: true,
		});

		if (!updateObjRef) {
			Logger.error('addEntryToAlgolia -> error', 'update failed');
			return null;
		}

		// console.log('getAllIdeas -> updateInAlgolia', resultRef);
		return updateObjRef;
	} catch (error) {
		Logger.error('getAllIdeas -> error', error);
		return null;
	}
};

module.exports = {
	addEntryToAlgolia,
};
