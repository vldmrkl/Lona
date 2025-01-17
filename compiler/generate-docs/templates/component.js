import { graphql } from 'gatsby'
import React from 'react'
import PropTypes from 'prop-types'
import { MDXRenderer } from '@mathieudutour/gatsby-mdx'
import Layout from '../src/components/Layout'
import Examples from '../src/components/Examples'
import Parameters from '../src/components/Parameters'
import { capitalise } from '../src/utils'
import ComponentTitle from '../lona-workspace/components/ComponentTitle.component'

export default function Template({ data, pageContext, location }) {
  // this will get replaced by the webpack context plugin
  // it is needed in order to map all the components
  const Component = require(`lona-workspace/${
    data.lonaComponent.componentPath
  }`).default

  // CamelCase title
  const componentName = pageContext.title
    .split(' ')
    .map(capitalise)
    .join('')

  if (data.mdx.frontmatter.overrideLayout) {
    return (
      <MDXRenderer
        scope={{
          Component,
          Examples,
          Layout,
          Parameters,
        }}
      >
        {data.mdx.code.body}
      </MDXRenderer>
    )
  }

  return (
    <Layout location={location}>
      <ComponentTitle
        name={pageContext.title}
        intro={data.mdx.frontmatter.intro}
      />
      <Examples
        scope={{ [componentName]: Component }}
        examples={data.lonaComponent.examples.map(example => {
          const params = JSON.parse(example.params)
          return {
            name: example.name,
            description: '',
            text: `<${componentName} ${Object.keys(params)
              .map(
                propName => `
  ${propName}={${JSON.stringify(params[propName])}}`
              )
              .join('')}${Object.keys(params).length ? '\n' : ''}/>`,
          }
        })}
      />
      <Parameters parameters={data.lonaComponent.params} />
      <MDXRenderer
        scope={{
          Component,
          Examples,
          Parameters,
        }}
      >
        {data.mdx.code.body}
      </MDXRenderer>
    </Layout>
  )
}

Template.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  pageContext: PropTypes.shape({
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    descriptionId: PropTypes.string.isRequired,
  }).isRequired,
  data: PropTypes.shape({
    lonaComponent: PropTypes.shape({
      examples: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          params: PropTypes.string.isRequired,
        })
      ),
      params: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          description: PropTypes.string,
        })
      ),
      componentPath: PropTypes.string.isRequired,
    }).isRequired,
    mdx: PropTypes.shape({
      frontmatter: PropTypes.shape({
        intro: PropTypes.string,
        overrideLayout: PropTypes.bool,
      }),
      code: PropTypes.shape({
        body: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
}

export const query = graphql`
  query ComponentById($id: String!, $descriptionId: String!) {
    lonaComponent(id: { eq: $id }) {
      examples {
        id
        name
        params
      }
      params {
        name
        type
        defaultValue
        description
      }
      componentPath
    }
    mdx(id: { eq: $descriptionId }) {
      frontmatter {
        intro
        overrideLayout
      }
      code {
        body
      }
    }
  }
`
