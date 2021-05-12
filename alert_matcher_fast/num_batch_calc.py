from scipy import optimize
from scipy.stats import poisson
import numpy as np
import math

from scipy import special
from scipy.special import entr, logsumexp, betaln, gammaln as gamln

# l=100
# t=120 # if t is too large, the convergence will fail
# imprecision = 0.05

def poi_coef(x, mu):
    return np.exp(special.xlogy(x, mu) - gamln(x + 1))


def get_num_batch(mean_occurance, threshold, precision):
    # TODO compute in log terms to avoid numerical error
    l=mean_occurance
    t=threshold # if t is too large, the convergence will fail, because it only need very little batch
    imprecision = 1-precision
    eps=1e-4
    def f(x):
        # val = poisson.cdf(t, l/x) * (1-np.exp(-l/x)) * (poisson.cdf(t, l*(x-1)/x))-imprecision
        # print(val)
        # return val

        # poi_pmf_1 = poisson.pmf(t+1, l/x)/math.exp(-l/x)
        poi_pmf_1 = poi_coef(t+1,l/x)
        # poi_pmf_1 = np.exp(np.log(poisson.pmf(t+1, l/x) + eps) - (-l/x))
        term1=(1-poi_pmf_1)
        # term1=(1-(l/x)**(t+1)/np.factorial(t+1)) # numerically unstable

        term2=(1-np.exp(-l/x))
        poi_pmf_2 = poi_coef(t+1, l*(x-1)/x) if poisson.pmf(t+1, l*(x-1)/x) > eps else 0
        # poi_pmf_2 = poisson.pmf(t+1, l*(x-1)/x)/np.exp(-l*(x-1)/x)
        # poi_pmf_2 = np.exp(np.log(poisson.pmf(t+1, l*(x-1)/x) + eps)-(-l*(x-1)/x))
        term3=(1-poi_pmf_2)
        # term3=(1-(l*(x-1)/x)**(t+1)/math.factorial(t+1)) # numerically unstable
        print(x, term1, term2, term3)

        return term1*term2*term3-imprecision

    def df(x):
        poi_pmf_1 = poi_coef(t+1,l/x)
        # poi_pmf_1 = poisson.pmf(t+1, l/x)/np.exp(-l/x)
        poi_pmf_2 = poi_coef(t+1, l*(x-1)/x) if poisson.pmf(t+1, l*(x-1)/x) > eps else 0
        # poi_pmf_2 = poisson.pmf(t+1, l*(x-1)/x)/np.exp(-l*(x-1)/x)
        
        # return -(l*(1-(l/x)**(t+1)/math.factorial(t+1))*(1-((l*(x-1))/x)**(t+1)/math.factorial(t+1))*math.exp(-l/x))/x**2-((t+1)*(1-(l/x)**(t+1)/math.factorial(t+1))*((l*(x-1))/x)**(t+1)*(l/x-(l*(x-1))/x**2)*x*(1-math.exp(-l/x)))/(math.factorial(t+1)*l*(x-1))+((t+1)*(1-((l*(x-1))/x)**(t+1)/math.factorial(t+1))*(l/x)**(t+1)*(1-math.exp(-l/x)))/(math.factorial(t+1)*x)
        return -(l*(1-poi_pmf_1)*(1-poi_pmf_2)*np.exp(-l/x))/x**2-((t+1)*(1-poi_pmf_1)*poi_pmf_2*(l/x-(l*(x-1))/x**2)*x*(1-np.exp(-l/x)))/(l*(x-1))+((t+1)*(1-poi_pmf_2)*poi_pmf_1*(1-np.exp(-l/x)))/(x)

    # sol = optimize.root_scalar(f, x0=l, bracket=[2, 1500], method='brentq', rtol=0.02, xtol=0.3)
    sol = optimize.root_scalar(f, x0=l, x1=3, fprime=df, bracket=[2, 1500], method='newton', rtol=0.02, xtol=0.3)
    print(sol)
    if sol.converged:
        root = math.ceil(sol.root)
        return 1500 if root > 1500 else 3 if root < 3 else root
    else:
        return 3

root = get_num_batch(1000, 1300, 0.95)
print(root)
# sol = optimize.root_scalar(f, bracket=[1, 1500], method='brentq', rtol=0.2, xtol=1)
# print(sol)
# print(sol.converged)
# print(math.ceil(sol.root))
# print(sol.converged)
# print(math.ceil(sol.root))


