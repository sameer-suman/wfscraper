import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
    const [keyword, setKeyword] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] =useState<string | null>(null);

    const keywords = [
        'Full Stack Engineer',
        'Data Scientist',
        'Designer',
        'Software Architect',
        'DevOps Engineer',
        'Software Engineer',
        'Engineering Manager',
        'Artificial Intelligence Engineer',
        'Machine Learning Engineer',
        'Product Manager',
        'Backend Engineer',
        'Mobile Engineer',
        'Product Designer',
        'Frontend Engineer'
    ];
    type Job = {
        company_name: string;
        job_title: string;
    };
    const fetchJobs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`https://wellfoundscrap.vercel.app/scrape`, {
                params: { keyword, page }
            });
            setJobs(response.data.jobs);
            if (page === 1) {
                setTotalPages(response.data.total_pages);
            }
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeywordChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setKeyword(e.target.value.replace(/\s+/g, '-').toLowerCase());
        setPage(1); // Reset to the first page when the keyword changes
        setJobs([]); // Clear previous jobs
        setError(null); // Clear any errors
    };
    
    const handleFetch = () => {
        if (!keyword) {
            setError('Please select a valid role before fetching.');
            return;
        }
        fetchJobs();
    };

    const handlePrevious = () => {
        if (page > 1) setPage((prevPage) => prevPage - 1);
    };

    const handleNext = () => {
        if (page < totalPages) setPage((prevPage) => prevPage + 1);
    };

    useEffect(() => {
        if (keyword) {
            fetchJobs();
        }
    }, [page]); // Fetch jobs when page changes
 
    return (
        <div style={{alignItems:'center',justifyContent:'center',display:'flex'}}>
        <div style={ {fontFamily: "'Roboto', sans-serif",textAlign: "center",backgroundColor: "white",padding: "20px",width:'80%'}}>
            <header style={styles.header}>
                <h1>Jobs</h1>
            </header>

            <div style={styles.searchBar}>
                <select value={keyword} onChange={handleKeywordChange} style={styles.select}>
                    <option value="">Select a role</option>
                    {keywords.map((job, index) => (
                        <option key={index} value={job.replace(/\s+/g, '-').toLowerCase()}>
                            {job}
                        </option>
                    ))}
                </select>
                <button onClick={handleFetch} style={styles.button}>Fetch</button>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            {loading ? (
                <p style={styles.loading}>Loading...</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Company</th>
                            <th style={styles.th}>Job Title</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map((job, index) => (
                            <tr key={index} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                                <td style={styles.td}>{job.company_name}</td>
                                <td style={styles.td}>{job.job_title}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div style={styles.pagination}>
                <button
                    onClick={handlePrevious}
                    disabled={page <= 1}
                    style={{
                        ...styles.button,
                        backgroundColor: page <= 1 ? '#ccc' : '#007BFF'
                    }}
                >
                    Previous
                </button>
                <span style={styles.pageInfo}>
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={handleNext}
                    disabled={page >= totalPages}
                    style={{
                        ...styles.button,
                        backgroundColor: page >= totalPages ? '#ccc' : '#007BFF'
                    }}
                >
                    Next
                </button>
            </div>
        </div></div>
    );
};

const styles = {
    header: {
        backgroundColor: '#007BFF',
        color: 'white',
        padding: '15px 0',
        marginBottom: '20px'
    },
    searchBar: {
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    select: {
        padding: '10px',
        width: '200px',
        marginRight: '10px',
        borderRadius: '5px',
        border: '1px solid #f0f0f0'
    },
    button: {
        padding: '10px 20px',
        color: '#fff',
        backgroundColor: '#007BFF',
        border: '1px solid #ccc',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: '0.3s',
        width:'150px'
    },
    error: {
        color: '#d9534f',
        margin: '20px auto',
        padding: '10px',
        backgroundColor: '#f8d7da',
        borderRadius: '5px',
        width: '80%',
        textAlign: 'center' as 'center'
    },
    table: {
        margin: '20px auto',
        padding:'10px',
        width: '80%',
        borderRadius: '5px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)'
    },
    th: {
        border: '1px solid #ddd',
        padding: '10px',
        backgroundColor: '#007BFF',
        borderRadius: '5px',
        color: 'white',
    },
    td: {
        border: '1px solid #ddd',
        padding: '10px',
        textAlign: 'center' as 'center',
        color:'black'
    },
    evenRow: {
        backgroundColor: '#f2f2f2'
    },
    oddRow: {
        backgroundColor: '#fff'
    },
    pagination: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pageInfo: {
        margin: '0 15px',
        fontSize: '16px',
        fontWeight: 'lighter'
    },
    footer: {
        marginTop: '20px',
        padding: '10px 0',
        backgroundColor: '#f1f1f1',
        color: '#333'
    },
    loading: {
        fontSize: '18px',
        fontWeight: 'lighter',
        color: '#555'
    }
};
export default App;
