export default function CompanyFiltersSection({ companyFilters }) {
  if (!companyFilters) return null

  const formatRange = (min, max, prefix = '', suffix = '') => {
    if (min && max) return `${prefix}${min?.toLocaleString()}${suffix} - ${prefix}${max?.toLocaleString()}${suffix}`
    if (min) return `${prefix}${min?.toLocaleString()}${suffix}+`
    if (max) return `Up to ${prefix}${max?.toLocaleString()}${suffix}`
    return 'Not specified'
  }

  const formatList = (list) => {
    if (!list || list.length === 0) return 'Not specified'
    return list.join(', ')
  }

  return (
    <div className="result-card">
      <h4>Company Filters</h4>
      <div className="filter-details">
        {/* Basic Filters */}
        <div>
          <strong>Employee Count:</strong> {formatRange(companyFilters.employee_count?.min, companyFilters.employee_count?.max)}
        </div>
        <div>
          <strong>ARR (USD):</strong> {formatRange(companyFilters.arr_usd?.min, companyFilters.arr_usd?.max, '$')}
        </div>
        <div>
          <strong>Industries:</strong> {formatList(companyFilters.industries)}
        </div>
        
        {/* Location Filters */}
        {(companyFilters.locations || companyFilters.cities || companyFilters.states || companyFilters.countries) && (
          <>
            {companyFilters.locations && (
              <div>
                <strong>Locations:</strong> {formatList(companyFilters.locations)}
              </div>
            )}
            {companyFilters.cities && (
              <div>
                <strong>Cities:</strong> {formatList(companyFilters.cities)}
              </div>
            )}
            {companyFilters.states && (
              <div>
                <strong>States:</strong> {formatList(companyFilters.states)}
              </div>
            )}
            {companyFilters.countries && (
              <div>
                <strong>Countries:</strong> {formatList(companyFilters.countries)}
              </div>
            )}
          </>
        )}
        
        {/* Company Characteristics */}
        {(companyFilters.founded_year_min || companyFilters.founded_year_max) && (
          <div>
            <strong>Founded Year:</strong> {formatRange(companyFilters.founded_year_min, companyFilters.founded_year_max)}
          </div>
        )}
        
        {companyFilters.company_types && (
          <div>
            <strong>Company Types:</strong> {formatList(companyFilters.company_types)}
          </div>
        )}
        
        {/* Technology & Keywords */}
        {companyFilters.technologies && (
          <div>
            <strong>Technologies:</strong> {formatList(companyFilters.technologies)}
          </div>
        )}
        
        {companyFilters.keywords && (
          <div>
            <strong>Keywords:</strong> {formatList(companyFilters.keywords)}
          </div>
        )}
        
        {companyFilters.exclude_keywords && (
          <div>
            <strong>Exclude Keywords:</strong> {formatList(companyFilters.exclude_keywords)}
          </div>
        )}
        
        {/* Funding Filters */}
        {(companyFilters.funding_stage || companyFilters.total_funding_min || companyFilters.total_funding_max) && (
          <>
            {companyFilters.funding_stage && (
              <div>
                <strong>Funding Stage:</strong> {formatList(companyFilters.funding_stage)}
              </div>
            )}
            {(companyFilters.total_funding_min || companyFilters.total_funding_max) && (
              <div>
                <strong>Total Funding:</strong> {formatRange(companyFilters.total_funding_min, companyFilters.total_funding_max, '$')}
              </div>
            )}
          </>
        )}
        
        {companyFilters.company_size && (
          <div>
            <strong>Company Size:</strong> {formatList(companyFilters.company_size)}
          </div>
        )}
      </div>
    </div>
  )
}
