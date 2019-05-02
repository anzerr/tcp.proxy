
module.exports = {
	safe: (cd) => {
		try {
			return cd();
		} catch(e) {
			//
		}
	},

	ENUM: {
		RX: 'recieved',
		TX: 'transmitted'
	}
};
