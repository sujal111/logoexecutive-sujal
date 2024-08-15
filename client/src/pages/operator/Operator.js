import React, {useState} from 'react';
import axios from 'axios'; // Import Axios
import Modal from '../../components/common/modal/Modal';
import './Operator.css';
import Card from './Card';

function Operator({queries}) {
	const [selectedQuery, setSelectedQuery] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [activeTab, setActiveTab] = useState('ACTIVE');
	const [response, setResponse] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [inputPage, setInputPage] = useState(1);
	const queriesPerPage = 5; // Number of queries per page

	const truncateText = (text, maxLength) => {
		if (text.length > maxLength) {
			return text.substring(0, maxLength) + '...';
		}
		return text;
	};

	const handleButtonClick = (query) => {
		setSelectedQuery(query);
		setModalOpen(true);
	};

	const handleModalClose = () => {
		setModalOpen(false);
		setSelectedQuery(null);
		setResponse('');
		setError('');
	};

	const handleResponseChange = (event) => {
		setResponse(event.target.value);
	};

	const handleSendResponse = async () => {
		if (!selectedQuery) return;

		setLoading(true);
		setError('');

		try {
			const responsePayload = {
				id: selectedQuery.id,
				email: selectedQuery.email,
				reply: response,
			};

			const {data} = await axios.put('/revert', responsePayload, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			alert(data.message);
			handleModalClose();
		} catch (err) {
			setError(
				err.response?.data?.message ||
					'Failed to send response. Please try again.',
			);
		} finally {
			setLoading(false);
		}
	};

	const handleTabChange = (tab) => {
		setActiveTab(tab);
		setCurrentPage(1); // Reset to the first page when switching tabs
		setInputPage(1); // Reset input page when switching tabs
	};

	// Filter queries based on the active tab
	const activeQueries = queries.filter((query) => !query.responded);
	const archivedQueries = queries.filter((query) => query.responded);

	// Get the queries for the current page
	const indexOfLastQuery = currentPage * queriesPerPage;
	const indexOfFirstQuery = indexOfLastQuery - queriesPerPage;
	const currentQueries =
		activeTab === 'ACTIVE'
			? activeQueries.slice(indexOfFirstQuery, indexOfLastQuery)
			: archivedQueries.slice(indexOfFirstQuery, indexOfLastQuery);

	// Pagination controls
	const totalPages = Math.ceil(
		(activeTab === 'ACTIVE' ? activeQueries.length : archivedQueries.length) /
			queriesPerPage,
	);

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
			setInputPage(currentPage + 1);
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
			setInputPage(currentPage - 1);
		}
	};

	const handlePageInputChange = (e) => {
		const value = e.target.value;
		if (value === '' || (Number(value) && Number(value) > 0)) {
			setInputPage(value);
		}
	};

	const handlePageInputBlur = () => {
		const page = Number(inputPage);
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		} else {
			setInputPage(currentPage);
		}
	};

	const handlePageInputKeyPress = (e) => {
		if (e.key === 'Enter') {
			handlePageInputBlur();
		}
	};

	return (
		<div className='operator-container'>
			<div className='tabs'>
				<button
					className={`tab ${activeTab === 'ACTIVE' ? 'active' : ''}`}
					onClick={() => handleTabChange('ACTIVE')}
				>
					ACTIVE
				</button>
				<button
					className={`tab ${activeTab === 'ARCHIVED' ? 'active' : ''}`}
					onClick={() => handleTabChange('ARCHIVED')}
				>
					ARCHIVED
				</button>
			</div>
			<div className='tab-content'>
				{currentQueries.length === 0 ? (
					<p>No queries available.</p>
				) : (
					currentQueries.map((query, index) => (
						<Card key={index} className='query-card'>
							<p>
								<strong>Message:</strong> {truncateText(query.message, 100)}
							</p>
							<div className='card-footer'>
								<span className='created-at'>
									{new Date(query.createdAt).toLocaleDateString()}
								</span>
							</div>
							<button
								className='view-response-button'
								onClick={() => handleButtonClick(query)}
							>
								Respond
							</button>
						</Card>
					))
				)}
			</div>

			{/* Pagination Controls */}
			{activeTab === 'ACTIVE' && activeQueries.length > queriesPerPage && (
				<div className='pagination'>
					<button
						className='pagination-button'
						onClick={handlePrevPage}
						disabled={currentPage === 1}
					>
						Previous
					</button>
					<span>
						Page{' '}
						<input
							type='text'
							value={inputPage}
							onChange={handlePageInputChange}
							onBlur={handlePageInputBlur}
							onKeyPress={handlePageInputKeyPress}
							className='pagination-input'
						/>{' '}
						of {totalPages}
					</span>
					<button
						className='pagination-button'
						onClick={handleNextPage}
						disabled={currentPage === totalPages}
					>
						Next
					</button>
				</div>
			)}
			{activeTab === 'ARCHIVED' && archivedQueries.length > queriesPerPage && (
				<div className='pagination'>
					<button
						className='pagination-button'
						onClick={handlePrevPage}
						disabled={currentPage === 1}
					>
						Previous
					</button>
					<span>
						Page{' '}
						<input
							type='text'
							value={inputPage}
							onChange={handlePageInputChange}
							onBlur={handlePageInputBlur}
							onKeyPress={handlePageInputKeyPress}
							className='pagination-input'
						/>{' '}
						of {totalPages}
					</span>
					<button
						className='pagination-button'
						onClick={handleNextPage}
						disabled={currentPage === totalPages}
					>
						Next
					</button>
				</div>
			)}

			{/* Modal for detailed query */}
			<Modal
				modalOpen={modalOpen}
				setModal={setModalOpen}
				showButtons={false}
				onClose={handleModalClose}
			>
				{selectedQuery && (
					<div className='query-details'>
						<h2>
							<strong>Respond to Customer</strong>
						</h2>
						<p>
							<strong>Inquiry:</strong> {selectedQuery.message}
						</p>
						<p>
							<strong>Response:</strong> {response}
						</p>

						<textarea
							className='response-textarea'
							value={response}
							onChange={handleResponseChange}
							placeholder='Write your response here...'
						/>
						<button
							className='send-response-button'
							onClick={handleSendResponse}
							disabled={loading} // Disable button while loading
						>
							{loading ? 'Sending...' : 'Send'}
						</button>
						{error && <p className='error-message'>{error}</p>}
					</div>
				)}
			</Modal>
		</div>
	);
}

export default Operator;