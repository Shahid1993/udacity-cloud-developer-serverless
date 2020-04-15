
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJGJI+Nu3wtvb9MA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi0yNWM4dHl6aC5hdXRoMC5jb20wHhcNMjAwNDE0MDcxMDIyWhcNMzMx
MjIyMDcxMDIyWjAhMR8wHQYDVQQDExZkZXYtMjVjOHR5emguYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuV/c6Ga4W5IP3ilor/cN96BV
/hka6VkAokGW9um/bu1SOD7P1d2u3k3OTKcmTZtfLPDdfLHl8yfOt9zhnr0YRoTq
KLbsVtlVj4xx3O/92qEkOF9sGZPOGrABb7TzLLRQNg12fsxQNaLXJoI7Z0fDr34b
qvn/gl4oqb879inbsdfWVT5beiTOl22WDf9phkmYyIStCxkX+LUpKy+szJxkaLu8
uyYxCspCBLm8iiC40u5cRALl9fEX7AYBvPk2f+fPtfjDyTqaM3ZKp5GzZvUm5g44
aN8p087qpwQuWbnzTMwb180sgoA6oVFKZuSUKXniokFY85brw+0yH6++ndbwywID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSR9E1ytFC2AFTmhBMn
RPzYLQTspzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAH1GvNj1
GPps6DPrrRpY9uBnn/Hok2xBLfzVaFQdWt643U5xLXVkI/E956Q6jxtPgICGxUd5
kdsOykkjU6MxmtnTX1r2kD2hlKmPq6Lp2gBvPeUA7cgqDLoV6BC1ED8PLbOmaG8H
0V5XGZi3oeEPsxkNEvEJFgwrOJ4QjAJSMjGKJ0fDrCqupAldyQCu/4CCsoeVxsMF
GCRY6QMsrOtE2UtBCZvJnBbd1PadG+yh72hyrxifgJcfGCLHug1fQBVy9hHzD1+I
ZyR6kgy/+Wn39MRp4A+q20j0PNCHP5Ozknl+Vzc2XHN08PzBsFpgKwKr5QNaZS55
l/4sDqPnn9AhscE=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {

  try{
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User was not authorized', e.message)
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }    
  }  
}


function verifyToken(authHeader: string): JwtToken {
  if (! authHeader)
    throw new Error('No authentication header')

  if (! authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken

}